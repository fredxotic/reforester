import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class SocketService {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.connectedUsers = new Map();
    this.setupSocketEvents();
  }

  setupSocketEvents() {
    this.io.use(this.authenticateSocket.bind(this));
    
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      this.connectedUsers.set(socket.userId, socket.id);

      // Join project rooms
      socket.on('join-project', (projectId) => {
        socket.join(`project:${projectId}`);
        console.log(`User ${socket.userId} joined project:${projectId}`);
      });

      // Join team rooms
      socket.on('join-team', (teamId) => {
        socket.join(`team:${teamId}`);
        console.log(`User ${socket.userId} joined team:${teamId}`);
      });

      // Chat messages
      socket.on('send-message', async (data) => {
        try {
          const message = await this.handleNewMessage(data, socket.userId);
          this.io.to(`project:${data.projectId}`).emit('new-message', message);
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Project updates
      socket.on('project-update', (data) => {
        this.io.to(`project:${data.projectId}`).emit('project-updated', data);
      });

      // Team updates
      socket.on('team-update', (data) => {
        this.io.to(`team:${data.teamId}`).emit('team-updated', data);
      });

      // Typing indicators
      socket.on('typing-start', (data) => {
        socket.to(`project:${data.projectId}`).emit('user-typing', {
          userId: socket.userId,
          projectId: data.projectId
        });
      });

      socket.on('typing-stop', (data) => {
        socket.to(`project:${data.projectId}`).emit('user-stop-typing', {
          userId: socket.userId,
          projectId: data.projectId
        });
      });

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  }

  async handleNewMessage(data, userId) {
    const Message = (await import('../models/Chat.js')).default;
    
    const message = new Message({
      content: data.content,
      sender: userId,
      project: data.projectId,
      team: data.teamId,
      type: data.type || 'text',
      attachments: data.attachments || []
    });

    await message.save();
    await message.populate('sender', 'name email avatar');
    
    return message;
  }

  // Utility methods
  emitToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
    }
  }

  emitToProject(projectId, event, data) {
    this.io.to(`project:${projectId}`).emit(event, data);
  }

  emitToTeam(teamId, event, data) {
    this.io.to(`team:${teamId}`).emit(event, data);
  }
}

export default SocketService;