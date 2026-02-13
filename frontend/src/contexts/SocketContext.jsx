import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-reforester.vercel.app';

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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const socketInstance = io(API_BASE_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        if (import.meta.env.DEV) {
          console.error('Socket connection error:', error.message);
        }
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // Disconnect when user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user]);

  const value = {
    socket,
    isConnected,
    joinProject: (projectId) => {
      if (socket) socket.emit('join-project', projectId);
    },
    leaveProject: (projectId) => {
      if (socket) socket.emit('leave-project', projectId);
    },
    joinTeam: (teamId) => {
      if (socket) socket.emit('join-team', teamId);
    },
    leaveTeam: (teamId) => {
      if (socket) socket.emit('leave-team', teamId);
    },
    sendMessage: (messageData) => {
      if (socket) socket.emit('send-message', messageData);
    },
    notifyProjectUpdate: (projectId, updateData) => {
      if (socket) socket.emit('project-update', { projectId, ...updateData });
    },
    notifyTeamUpdate: (teamId, updateData) => {
      if (socket) socket.emit('team-update', { teamId, ...updateData });
    },
    startTyping: (projectId) => {
      if (socket) socket.emit('typing-start', { projectId });
    },
    stopTyping: (projectId) => {
      if (socket) socket.emit('typing-stop', { projectId });
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};