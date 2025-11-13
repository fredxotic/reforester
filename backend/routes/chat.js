import express from 'express';
import Message from '../models/Chat.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get project messages
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({
      project: req.params.projectId
    })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: 'Could not retrieve chat messages'
    });
  }
});

// Get team messages
router.get('/team/:teamId', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const messages = await Message.find({
      team: req.params.teamId
    })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get team messages error:', error);
    res.status(500).json({
      error: 'Failed to fetch team messages',
      message: 'Could not retrieve team chat messages'
    });
  }
});

// Send message
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, projectId, teamId, type = 'text', attachments = [] } = req.body;

    if (!content && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        error: 'Missing content',
        message: 'Message content or attachments are required'
      });
    }

    const message = new Message({
      content,
      sender: req.user._id,
      project: projectId,
      team: teamId,
      type,
      attachments
    });

    await message.save();
    await message.populate('sender', 'name email avatar');

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: 'Could not send message'
    });
  }
});

// Mark messages as read
router.post('/mark-read', authenticateToken, async (req, res) => {
  try {
    const { messageIds, projectId } = req.body;

    await Message.updateMany(
      {
        _id: { $in: messageIds },
        project: projectId,
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    res.json({
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      error: 'Failed to mark messages as read',
      message: 'Could not update message status'
    });
  }
});

export default router;