import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      const socketInstance = io(process.env.VITE_API_BASE_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user, token]);

  const value = {
    socket,
    isConnected,
    joinProject: (projectId) => {
      if (socket) {
        socket.emit('join-project', projectId);
      }
    },
    joinTeam: (teamId) => {
      if (socket) {
        socket.emit('join-team', teamId);
      }
    },
    sendMessage: (messageData) => {
      if (socket) {
        socket.emit('send-message', messageData);
      }
    },
    notifyProjectUpdate: (projectId, updateData) => {
      if (socket) {
        socket.emit('project-update', {
          projectId,
          ...updateData
        });
      }
    },
    notifyTeamUpdate: (teamId, updateData) => {
      if (socket) {
        socket.emit('team-update', {
          teamId,
          ...updateData
        });
      }
    },
    startTyping: (projectId) => {
      if (socket) {
        socket.emit('typing-start', { projectId });
      }
    },
    stopTyping: (projectId) => {
      if (socket) {
        socket.emit('typing-stop', { projectId });
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};