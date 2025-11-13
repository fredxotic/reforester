import express from 'express';
import Team from '../models/Team.js';
import Collaboration from '../models/Collaboration.js';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user's teams
router.get('/my-teams', authenticateToken, async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.status': 'active' }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ createdAt: -1 });

    res.json({ teams });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({
      error: 'Failed to fetch teams',
      message: 'Could not retrieve teams'
    });
  }
});

// Create new team
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, settings, tags } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Team name is required'
      });
    }

    const team = new Team({
      name,
      description,
      owner: req.user._id,
      settings: settings || {},
      tags: tags || []
    });

    // Add creator as admin member
    team.members.push({
      user: req.user._id,
      role: 'admin',
      status: 'active'
    });

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    // Add team to user's teams
    await req.user.addToTeam(team._id, 'admin');

    res.status(201).json({
      message: 'Team created successfully',
      team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({
      error: 'Failed to create team',
      message: 'Could not create team'
    });
  }
});

// Get team details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id, 'members.status': 'active' }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('projects');

    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team not found or access denied'
      });
    }

    // Get team projects through collaborations
    const collaborations = await Collaboration.find({
      team: team._id,
      status: 'active'
    }).populate('project');

    res.json({
      team,
      projects: collaborations.map(c => c.project)
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({
      error: 'Failed to fetch team',
      message: 'Could not retrieve team details'
    });
  }
});

// Update team
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'members.user': req.user._id, 
          'members.status': 'active',
          'members.role': { $in: ['admin', 'manager'] }
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team not found or insufficient permissions'
      });
    }

    const allowedUpdates = ['name', 'description', 'settings', 'tags', 'avatar'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        team[field] = req.body[field];
      }
    });

    await team.save();
    await team.populate('owner', 'name email avatar');
    await team.populate('members.user', 'name email avatar');

    res.json({
      message: 'Team updated successfully',
      team
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({
      error: 'Failed to update team',
      message: 'Could not update team'
    });
  }
});

// Add team member
router.post('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { userId, role = 'member' } = req.body;

    const team = await Team.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'members.user': req.user._id, 
          'members.status': 'active',
          'members.role': { $in: ['admin', 'manager'] }
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team not found or insufficient permissions'
      });
    }

    await team.addMember(userId, role);
    await team.populate('members.user', 'name email avatar');

    res.json({
      message: 'Member added successfully',
      team
    });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      error: 'Failed to add member',
      message: 'Could not add team member'
    });
  }
});

// Remove team member
router.delete('/:id/members/:userId', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'members.user': req.user._id, 
          'members.status': 'active',
          'members.role': { $in: ['admin', 'manager'] }
        }
      ]
    });

    if (!team) {
      return res.status(404).json({
        error: 'Team not found',
        message: 'Team not found or insufficient permissions'
      });
    }

    // Prevent removing owner
    if (req.params.userId === team.owner.toString()) {
      return res.status(400).json({
        error: 'Cannot remove owner',
        message: 'Team owner cannot be removed'
      });
    }

    await team.removeMember(req.params.userId);
    await team.populate('members.user', 'name email avatar');

    res.json({
      message: 'Member removed successfully',
      team
    });
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      error: 'Failed to remove member',
      message: 'Could not remove team member'
    });
  }
});

// Invite to team (via email)
router.post('/:id/invite', authenticateToken, async (req, res) => {
  try {
    const { email, role = 'member' } = req.body;

    // Implementation for email invitations would go here
    // This would integrate with your email service

    res.json({
      message: 'Invitation sent successfully'
    });
  } catch (error) {
    console.error('Team invite error:', error);
    res.status(500).json({
      error: 'Failed to send invitation',
      message: 'Could not send team invitation'
    });
  }
});

export default router;