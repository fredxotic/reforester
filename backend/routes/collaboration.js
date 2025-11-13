import express from 'express';
import Collaboration from '../models/Collaboration.js';
import Project from '../models/Project.js';
import Team from '../models/Team.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Share project with team
router.post('/share-project', authenticateToken, async (req, res) => {
  try {
    const { projectId, teamId, permissions } = req.body;

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    const team = await Team.findOne({
      _id: teamId,
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

    // Check if collaboration already exists
    const existingCollaboration = await Collaboration.findOne({
      project: projectId,
      team: teamId
    });

    if (existingCollaboration) {
      return res.status(400).json({
        error: 'Already shared',
        message: 'Project is already shared with this team'
      });
    }

    const collaboration = new Collaboration({
      project: projectId,
      team: teamId,
      createdBy: req.user._id,
      permissions: permissions || {
        canEdit: false,
        canInvite: false,
        canManage: false
      }
    });

    await collaboration.save();

    // Add project to team's projects
    await Team.findByIdAndUpdate(teamId, {
      $addToSet: { projects: projectId }
    });

    res.status(201).json({
      message: 'Project shared successfully',
      collaboration
    });
  } catch (error) {
    console.error('Share project error:', error);
    res.status(500).json({
      error: 'Failed to share project',
      message: 'Could not share project with team'
    });
  }
});

// Get project collaborations
router.get('/project/:projectId', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or access denied'
      });
    }

    const collaborations = await Collaboration.find({
      project: req.params.projectId
    })
    .populate('team', 'name avatar')
    .populate('createdBy', 'name email');

    res.json({ collaborations });
  } catch (error) {
    console.error('Get collaborations error:', error);
    res.status(500).json({
      error: 'Failed to fetch collaborations',
      message: 'Could not retrieve project collaborations'
    });
  }
});

// Update collaboration permissions
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { permissions } = req.body;

    const collaboration = await Collaboration.findOne({
      _id: req.params.id
    }).populate('project');

    if (!collaboration) {
      return res.status(404).json({
        error: 'Collaboration not found',
        message: 'Collaboration not found'
      });
    }

    // Check if user owns the project
    if (collaboration.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'Only project owner can update collaboration permissions'
      });
    }

    collaboration.permissions = { ...collaboration.permissions, ...permissions };
    await collaboration.save();

    res.json({
      message: 'Collaboration updated successfully',
      collaboration
    });
  } catch (error) {
    console.error('Update collaboration error:', error);
    res.status(500).json({
      error: 'Failed to update collaboration',
      message: 'Could not update collaboration permissions'
    });
  }
});

// Remove collaboration
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({
      _id: req.params.id
    }).populate('project');

    if (!collaboration) {
      return res.status(404).json({
        error: 'Collaboration not found',
        message: 'Collaboration not found'
      });
    }

    // Check if user owns the project
    if (collaboration.project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Permission denied',
        message: 'Only project owner can remove collaboration'
      });
    }

    // Remove project from team
    await Team.findByIdAndUpdate(collaboration.team, {
      $pull: { projects: collaboration.project._id }
    });

    await Collaboration.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Collaboration removed successfully'
    });
  } catch (error) {
    console.error('Remove collaboration error:', error);
    res.status(500).json({
      error: 'Failed to remove collaboration',
      message: 'Could not remove collaboration'
    });
  }
});

export default router;