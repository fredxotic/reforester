import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatAPI } from '../../services/chatApi';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';

const TYPING_THROTTLE_MS = 2000;

const ChatPanel = ({ projectId, teamId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  const { socket, isConnected, leaveProject, leaveTeam } = useSocket();
  const { user } = useAuth();

  const chatId = projectId || teamId;
  const chatType = projectId ? 'project' : 'team';

  useEffect(() => {
    if (!chatId) return;

    setLoading(true);
    setError(null);
    loadMessages();
    setupSocketListeners();
    
    return () => {
      // Leave the room on cleanup
      if (projectId) {
        leaveProject?.(projectId);
      } else if (teamId) {
        leaveTeam?.(teamId);
      }
      // Remove listeners
      if (socket) {
        socket.off('new-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      }
      // Clear typing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [chatId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = chatType === 'project' 
        ? await chatAPI.getProjectMessages(chatId)
        : await chatAPI.getTeamMessages(chatId);
      
      setMessages(response.messages);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;

    // Join the appropriate room
    if (projectId) {
      socket.emit('join-project', projectId);
    } else if (teamId) {
      socket.emit('join-team', teamId);
    }

    // Listen for new messages
    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Typing indicators
    socket.on('user-typing', (data) => {
      if (data.userId !== user?._id) {
        setTypingUsers(prev => new Set(prev).add(data.userId));
      }
    });

    socket.on('user-stop-typing', (data) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    setError(null);
    
    try {
      const messageData = {
        content: newMessage.trim(),
        projectId,
        teamId,
        type: 'text'
      };

      if (socket && isConnected) {
        socket.emit('send-message', messageData);
      } else {
        // Fallback to HTTP API
        await chatAPI.sendMessage(messageData);
        await loadMessages();
      }

      setNewMessage('');
      stopTyping();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Throttled typing indicator - avoids emitting on every keystroke
  const handleTyping = useCallback(() => {
    if (!socket || !isConnected) return;

    const now = Date.now();
    if (now - lastTypingEmitRef.current > TYPING_THROTTLE_MS) {
      socket.emit('typing-start', { projectId, teamId });
      lastTypingEmitRef.current = now;
    }

    // Auto stop-typing after inactivity
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }
    typingTimerRef.current = setTimeout(() => {
      stopTyping();
    }, TYPING_THROTTLE_MS);
  }, [socket, isConnected, projectId, teamId]);

  const stopTyping = useCallback(() => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { projectId, teamId });
    }
    lastTypingEmitRef.current = 0;
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }, [socket, isConnected, projectId, teamId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-emerald-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-emerald-200">
      {/* Messages Header */}
      <div className="p-4 border-b border-emerald-200 bg-emerald-50 rounded-t-lg">
        <h3 className="font-semibold text-emerald-900">
          {chatType === 'project' ? 'Project Chat' : 'Team Chat'}
        </h3>
        {!isConnected && (
          <div className="text-amber-600 text-sm mt-1">
            Connection lost - reconnecting...
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-sm border-b border-red-200 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold ml-2">&times;</button>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-emerald-600 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.sender._id === user?._id
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-emerald-100 text-emerald-900 rounded-bl-none'
                }`}
              >
                {message.sender._id !== user?._id && (
                  <div className="text-xs font-medium text-emerald-700 mb-1">
                    {message.sender.name}
                  </div>
                )}
                <div className="text-sm">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.sender._id === user?._id
                      ? 'text-emerald-200'
                      : 'text-emerald-600'
                  }`}
                >
                  {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-emerald-100 text-emerald-900 px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-emerald-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="flex-1 border border-emerald-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;