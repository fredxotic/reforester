import express from 'express';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import connectDB from '../config/database.js'; // ADD THIS IMPORT

const router = express.Router();

// Get all projects for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const { status, limit = 10, page = 1 } = req.query;
    
    const query = { 
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('owner', 'name email avatar')
      .populate('teamMembers.user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: 'Failed to fetch projects',
      message: 'Could not retrieve projects'
    });
  }
});

// Get single project
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    })
    .populate('owner', 'name email avatar')
    .populate('teamMembers.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or access denied'
      });
    }

    res.json({ project });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      error: 'Failed to fetch project',
      message: 'Could not retrieve project'
    });
  }
});

// Create new project
router.post('/', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const {
      name,
      description,
      location,
      environmentalData,
      species,
      timeline,
      budget,
      tags
    } = req.body;

    // Validation
    if (!name || !location || !location.coordinates) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Project name and location are required'
      });
    }

    const project = new Project({
      name,
      description,
      location,
      environmentalData,
      species: species || [],
      timeline: {
        startDate: timeline?.startDate || new Date(),
        milestones: timeline?.milestones || []
      },
      budget: budget || {},
      tags: tags || [],
      owner: req.user._id,
      teamMembers: [{
        user: req.user._id,
        role: 'manager'
      }]
    });

    await project.save();
    await project.populate('owner', 'name email avatar');

    // Add project to user's projects array
    req.user.projects.push(project._id);
    await req.user.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: 'Could not create project'
    });
  }
});

// Update project
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'teamMembers.user': req.user._id,
          'teamMembers.role': { $in: ['manager', 'contributor'] }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    const allowedUpdates = [
      'name', 'description', 'location', 'environmentalData', 
      'species', 'timeline', 'budget', 'status', 'visibility', 'tags'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'species' && Array.isArray(req.body.species)) {
          project.species = req.body.species;
        } else if (field === 'timeline' && typeof req.body.timeline === 'object') {
          project.timeline = { ...project.timeline, ...req.body.timeline };
        } else if (field === 'budget' && typeof req.body.budget === 'object') {
          project.budget = { ...project.budget, ...req.body.budget };
        } else {
          project[field] = req.body[field];
        }
      }
    });

    await project.save();
    await project.populate('owner', 'name email avatar');
    await project.populate('teamMembers.user', 'name email avatar');

    res.json({
      message: 'Project updated successfully',
      project
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'Failed to update project',
      message: 'Could not update project'
    });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id // Only owner can delete
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    // Remove project from user's projects array
    req.user.projects = req.user.projects.filter(
      projectId => projectId.toString() !== req.params.id
    );
    await req.user.save();

    res.json({
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Failed to delete project',
      message: 'Could not delete project'
    });
  }
});

// Add team member to project
router.post('/:id/team', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const { userId, role = 'contributor' } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'teamMembers.user': req.user._id,
          'teamMembers.role': 'manager'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    await project.addTeamMember(userId, role);
    await project.populate('teamMembers.user', 'name email avatar');

    res.json({
      message: 'Team member added successfully',
      project
    });

  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      error: 'Failed to add team member',
      message: 'Could not add team member to project'
    });
  }
});

// Remove team member from project
router.delete('/:id/team/:userId', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'teamMembers.user': req.user._id,
          'teamMembers.role': 'manager'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    // Prevent removing owner
    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({
        error: 'Cannot remove owner',
        message: 'Project owner cannot be removed from team'
      });
    }

    await project.removeTeamMember(req.params.userId);
    await project.populate('teamMembers.user', 'name email avatar');

    res.json({
      message: 'Team member removed successfully',
      project
    });

  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      error: 'Failed to remove team member',
      message: 'Could not remove team member from project'
    });
  }
});

// Add milestone to project
router.post('/:id/milestones', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const { name, description, targetDate } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'teamMembers.user': req.user._id,
          'teamMembers.role': { $in: ['manager', 'contributor'] }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    project.timeline.milestones.push({
      name,
      description,
      targetDate: targetDate ? new Date(targetDate) : undefined
    });

    await project.save();
    await project.updateProgress();

    res.json({
      message: 'Milestone added successfully',
      project
    });

  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      error: 'Failed to add milestone',
      message: 'Could not add milestone to project'
    });
  }
});

// Update milestone completion
router.put('/:id/milestones/:milestoneId', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const { completed } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user._id },
        { 
          'teamMembers.user': req.user._id,
          'teamMembers.role': { $in: ['manager', 'contributor'] }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or insufficient permissions'
      });
    }

    const milestone = project.timeline.milestones.id(req.params.milestoneId);
    if (!milestone) {
      return res.status(404).json({
        error: 'Milestone not found',
        message: 'Milestone not found in project'
      });
    }

    milestone.completed = completed;
    if (completed) {
      milestone.completedDate = new Date();
    } else {
      milestone.completedDate = undefined;
    }

    await project.save();
    await project.updateProgress();

    res.json({
      message: 'Milestone updated successfully',
      project
    });

  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      error: 'Failed to update milestone',
      message: 'Could not update milestone'
    });
  }
});

// Get project analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const project = await Project.findOne({
      _id: req.params.id,
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

    // Calculate additional analytics
    const analytics = {
      basic: project.analytics,
      speciesBreakdown: project.species.map(species => ({
        name: species.name,
        quantity: species.quantity,
        percentage: (species.quantity / project.analytics.totalTrees) * 100,
        survivalRate: species.survivalRate
      })),
      budgetUtilization: project.budget.estimatedCost ? 
        (project.budget.actualCost || 0) / project.budget.estimatedCost * 100 : 0,
      timelineProgress: project.analytics.progress,
      environmentalImpact: {
        carbonSequestration: project.analytics.estimatedCarbonSequestration,
        oxygenProduction: project.analytics.totalTrees * 260, // kg per year per tree
        soilConservation: project.analytics.areaCovered * 10 // arbitrary soil conservation score
      }
    };

    res.json({ analytics });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: 'Could not retrieve project analytics'
    });
  }
});

// Create project from analysis
router.post('/from-analysis', authenticateToken, async (req, res) => {
  try {
    await connectDB(); // ADD THIS LINE

    const { name, description, analysisData, species } = req.body;

    if (!name || !analysisData || !analysisData.coordinates) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Project name and analysis data are required'
      });
    }

    const project = new Project({
      name,
      description,
      owner: req.user._id,
      location: {
        coordinates: {
          lat: analysisData.coordinates.lat,
          lon: analysisData.coordinates.lon
        }
      },
      environmentalData: {
        soil: analysisData.soil,
        weather: analysisData.weather,
        biome: analysisData.recommendation?.text?.includes('tropical') ? 'tropical' : 
               analysisData.recommendation?.text?.includes('temperate') ? 'temperate' : 'boreal',
        analysisTimestamp: new Date(analysisData.timestamp)
      },
      species: species || [],
      timeline: {
        startDate: new Date()
      },
      teamMembers: [{
        user: req.user._id,
        role: 'manager'
      }]
    });

    await project.save();
    await project.populate('owner', 'name email avatar');

    // Add project to user's projects array
    req.user.projects.push(project._id);
    await req.user.save();

    res.status(201).json({
      message: 'Project created from analysis successfully',
      project
    });

  } catch (error) {
    console.error('Create project from analysis error:', error);
    res.status(500).json({
      error: 'Failed to create project',
      message: 'Could not create project from analysis'
    });
  }
});

export default router;