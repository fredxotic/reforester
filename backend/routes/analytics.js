import express from 'express';
import Project from '../models/Project.js';
import { authenticateToken } from '../middleware/auth.js';
import {
  CARBON_CREDIT_RATE_USD,
  CO2_PER_TREE_KG_YEAR,
  DEFAULT_SURVIVAL_RATE,
  MATURITY_YEARS,
  CARBON_PAYBACK_YEARS
} from '../constants/environment.js';

const router = express.Router();

// Get analytics overview for user
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    }).populate('owner', 'name email avatar');

    // Calculate overview statistics
    const overview = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      totalTrees: projects.reduce((sum, p) => sum + (p.analytics?.totalTrees || 0), 0),
      totalArea: projects.reduce((sum, p) => sum + (p.analytics?.areaCovered || 0), 0),
      totalCarbon: projects.reduce((sum, p) => sum + (p.analytics?.estimatedCarbonSequestration || 0), 0),
      averageSurvivalRate: projects.length > 0 ? 
        projects.reduce((sum, p) => sum + (p.analytics?.survivalRate || 0), 0) / projects.length : 0
    };

    // Project status distribution
    const statusDistribution = {
      planning: projects.filter(p => p.status === 'planning').length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      'on-hold': projects.filter(p => p.status === 'on-hold').length
    };

    // Species diversity
    const allSpecies = projects.flatMap(p => p.species || []);
    const speciesCount = allSpecies.reduce((acc, species) => {
      acc[species.name] = (acc[species.name] || 0) + (species.quantity || 0);
      return acc;
    }, {});

    res.json({
      overview,
      statusDistribution,
      topSpecies: Object.entries(speciesCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count })),
      recentActivity: projects
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(p => ({
          id: p._id,
          name: p.name,
          action: 'updated',
          timestamp: p.updatedAt
        }))
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics overview',
      message: 'Could not retrieve analytics data'
    });
  }
});

// Get growth projections for a project
router.get('/project/:id/growth-projections', authenticateToken, async (req, res) => {
  try {
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

    // Generate growth projections (simplified model)
    const projections = generateGrowthProjections(project);
    
    res.json({ projections });

  } catch (error) {
    console.error('Growth projections error:', error);
    res.status(500).json({
      error: 'Failed to generate growth projections',
      message: 'Could not calculate growth projections'
    });
  }
});

// Get carbon sequestration timeline
router.get('/project/:id/carbon-timeline', authenticateToken, async (req, res) => {
  try {
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

    const carbonTimeline = generateCarbonTimeline(project);
    
    res.json({ carbonTimeline });

  } catch (error) {
    console.error('Carbon timeline error:', error);
    res.status(500).json({
      error: 'Failed to generate carbon timeline',
      message: 'Could not calculate carbon sequestration timeline'
    });
  }
});

// Get biodiversity impact
router.get('/project/:id/biodiversity', authenticateToken, async (req, res) => {
  try {
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

    const biodiversityImpact = calculateBiodiversityImpact(project);
    
    res.json({ biodiversityImpact });

  } catch (error) {
    console.error('Biodiversity impact error:', error);
    res.status(500).json({
      error: 'Failed to calculate biodiversity impact',
      message: 'Could not assess biodiversity impact'
    });
  }
});

// Get financial analytics
router.get('/project/:id/financial', authenticateToken, async (req, res) => {
  try {
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

    const financialAnalytics = calculateFinancialAnalytics(project);
    
    res.json({ financialAnalytics });

  } catch (error) {
    console.error('Financial analytics error:', error);
    res.status(500).json({
      error: 'Failed to calculate financial analytics',
      message: 'Could not analyze financial data'
    });
  }
});

// Get comparative analytics across projects
router.get('/comparative', authenticateToken, async (req, res) => {
  try {
    const { metric = 'carbon_sequestration', period = 'year' } = req.query;
    
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { 'teamMembers.user': req.user._id }
      ]
    });

    const comparativeData = generateComparativeAnalytics(projects, metric, period);
    
    res.json({ comparativeData });

  } catch (error) {
    console.error('Comparative analytics error:', error);
    res.status(500).json({
      error: 'Failed to generate comparative analytics',
      message: 'Could not compare project metrics'
    });
  }
});

// Helper function to generate growth projections
function generateGrowthProjections(project) {
  const startDate = new Date(project.timeline?.startDate || new Date());
  const projections = [];
  const totalTrees = project.analytics?.totalTrees || 0;
  
  // Simplified growth model (in reality, this would use species-specific growth rates)
  for (let year = 0; year <= 20; year++) {
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + year);
    
    // Carbon sequestration increases as trees mature
    const maturityFactor = Math.min(1, year / MATURITY_YEARS);
    const survivalRate = project.analytics?.survivalRate || DEFAULT_SURVIVAL_RATE;
    const survivingTrees = totalTrees * (survivalRate / 100);
    
    // Average mature tree sequesters CO2_PER_TREE_KG_YEAR kg CO2 per year
    const carbonSequestration = survivingTrees * CO2_PER_TREE_KG_YEAR * maturityFactor / 1000; // tons
    
    // Tree height growth (simplified)
    const avgHeight = Math.min(25, 2 + (year * 2.3)); // meters
    
    // Canopy coverage
    const canopyCoverage = (project.analytics?.areaCovered || 0) * maturityFactor;
    
    projections.push({
      year,
      date: date.toISOString().split('T')[0],
      survivingTrees: Math.round(survivingTrees),
      carbonSequestration: parseFloat(carbonSequestration.toFixed(2)),
      avgHeight: parseFloat(avgHeight.toFixed(1)),
      canopyCoverage: parseFloat(canopyCoverage.toFixed(2)),
      biodiversityScore: Math.min(100, 20 + (year * 8)) // Simplified biodiversity score
    });
  }
  
  return projections;
}

// Helper function to generate carbon timeline
function generateCarbonTimeline(project) {
  const timeline = [];
  const startDate = new Date(project.timeline?.startDate || new Date());
  const totalTrees = project.analytics?.totalTrees || 0;
  const survivalRate = project.analytics?.survivalRate || DEFAULT_SURVIVAL_RATE;
  
  let cumulativeCarbon = 0;
  
  for (let month = 0; month <= 240; month += 12) { // 20 years, yearly data
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + month);
    
    const year = month / 12;
    const maturityFactor = Math.min(1, year / MATURITY_YEARS);
    const annualCarbon = totalTrees * (survivalRate / 100) * CO2_PER_TREE_KG_YEAR * maturityFactor / 1000;
    cumulativeCarbon += annualCarbon;
    
    timeline.push({
      period: `Year ${year + 1}`,
      date: date.toISOString().split('T')[0],
      annualCarbon: parseFloat(annualCarbon.toFixed(2)),
      cumulativeCarbon: parseFloat(cumulativeCarbon.toFixed(2)),
      treesActive: Math.round(totalTrees * (survivalRate / 100) * maturityFactor)
    });
  }
  
  return timeline;
}

// Helper function to calculate biodiversity impact
function calculateBiodiversityImpact(project) {
  const speciesCount = project.species?.length || 0;
  const totalTrees = project.analytics?.totalTrees || 0;
  const area = project.analytics?.areaCovered || 1; // Avoid division by zero
  
  // Simplified biodiversity scoring
  let score = 0;
  
  // Species diversity (max 40 points)
  score += Math.min(40, speciesCount * 8);
  
  // Tree density (max 30 points) - optimal density ~1000 trees/hectare
  const density = totalTrees / area;
  const optimalDensity = 1000;
  score += Math.min(30, 30 * (1 - Math.abs(density - optimalDensity) / optimalDensity));
  
  // Native species bonus (max 20 points) - assuming all are native for now
  score += 20;
  
  // Area impact (max 10 points)
  score += Math.min(10, area * 2);
  
  const impactLevels = [
    { threshold: 80, level: 'High', color: '#10b981', description: 'Excellent biodiversity impact' },
    { threshold: 60, level: 'Medium', color: '#f59e0b', description: 'Good biodiversity impact' },
    { threshold: 40, level: 'Low', color: '#ef4444', description: 'Moderate biodiversity impact' },
    { threshold: 0, level: 'Minimal', color: '#6b7280', description: 'Limited biodiversity impact' }
  ];
  
  const level = impactLevels.find(l => score >= l.threshold);
  
  return {
    score: Math.round(score),
    level: level.level,
    color: level.color,
    description: level.description,
    metrics: {
      speciesDiversity: speciesCount,
      treeDensity: parseFloat((totalTrees / area).toFixed(1)),
      areaHectares: parseFloat(area.toFixed(2)),
      nativeSpeciesRatio: 1.0 // Assuming all native for now
    },
    recommendations: generateBiodiversityRecommendations(project, score)
  };
}

// Helper function for biodiversity recommendations
function generateBiodiversityRecommendations(project, score) {
  const recommendations = [];
  
  if ((project.species?.length || 0) < 3) {
    recommendations.push({
      priority: 'high',
      action: 'Increase species diversity',
      description: 'Add more native tree species to improve ecosystem resilience',
      impact: 'High biodiversity improvement'
    });
  }
  
  if (score < 60) {
    recommendations.push({
      priority: 'medium',
      action: 'Consider understory planting',
      description: 'Add shrubs and ground cover to create multi-layer forest structure',
      impact: 'Medium biodiversity improvement'
    });
  }
  
  if ((project.analytics?.areaCovered || 0) < 5) {
    recommendations.push({
      priority: 'low',
      action: 'Expand project area if possible',
      description: 'Larger contiguous areas support more wildlife species',
      impact: 'Long-term biodiversity improvement'
    });
  }
  
  return recommendations;
}

// Helper function for financial analytics
function calculateFinancialAnalytics(project) {
  const estimatedCost = project.budget?.estimatedCost || 0;
  const actualCost = project.budget?.actualCost || 0;
  const totalTrees = project.analytics?.totalTrees || 0;
  
  const costPerTree = totalTrees > 0 ? (actualCost || estimatedCost) / totalTrees : 0;
  const carbonCost = (project.analytics?.estimatedCarbonSequestration || 0) > 0 ? 
    (actualCost || estimatedCost) / (project.analytics.estimatedCarbonSequestration || 1) : 0;
  
  // Simplified ROI calculation
  const carbonCreditValue = (project.analytics?.estimatedCarbonSequestration || 0) * CARBON_CREDIT_RATE_USD;
  const roi = estimatedCost > 0 ? ((carbonCreditValue - estimatedCost) / estimatedCost) * 100 : 0;
  
  return {
    financials: {
      estimatedCost: parseFloat(estimatedCost.toFixed(2)),
      actualCost: parseFloat(actualCost.toFixed(2)),
      costVariance: parseFloat((actualCost - estimatedCost).toFixed(2)),
      costVariancePercentage: estimatedCost > 0 ? 
        parseFloat(((actualCost - estimatedCost) / estimatedCost * 100).toFixed(1)) : 0
    },
    efficiency: {
      costPerTree: parseFloat(costPerTree.toFixed(2)),
      costPerTonCarbon: parseFloat(carbonCost.toFixed(2)),
      carbonCreditValue: parseFloat(carbonCreditValue.toFixed(2))
    },
    roi: {
      percentage: parseFloat(roi.toFixed(1)),
      netValue: parseFloat((carbonCreditValue - estimatedCost).toFixed(2)),
      paybackPeriod: estimatedCost > 0 ? 
        parseFloat((estimatedCost / (carbonCreditValue / CARBON_PAYBACK_YEARS)).toFixed(1)) : 0
    },
    recommendations: generateFinancialRecommendations(project, roi)
  };
}

// Helper function for financial recommendations
function generateFinancialRecommendations(project, roi) {
  const recommendations = [];
  
  if (roi < 0) {
    recommendations.push({
      priority: 'high',
      action: 'Review cost structure',
      description: 'Consider local species and community involvement to reduce costs',
      impact: 'Potential cost reduction 20-40%'
    });
  }
  
  if (project.budget?.fundingSource === 'personal' && project.budget.estimatedCost > 1000) {
    recommendations.push({
      priority: 'medium',
      action: 'Explore grant opportunities',
      description: 'Research environmental grants and carbon credit programs',
      impact: 'Potential funding support'
    });
  }
  
  if ((project.analytics?.survivalRate || 0) < 80) {
    recommendations.push({
      priority: 'high',
      action: 'Improve survival rates',
      description: 'Better planting techniques and maintenance can improve ROI significantly',
      impact: '20-30% better financial returns'
    });
  }
  
  return recommendations;
}

// Helper function for comparative analytics
function generateComparativeAnalytics(projects, metric, period) {
  const comparativeData = projects.map(project => {
    let value = 0;
    
    switch (metric) {
      case 'carbon_sequestration':
        value = project.analytics?.estimatedCarbonSequestration || 0;
        break;
      case 'cost_efficiency':
        const trees = project.analytics?.totalTrees || 1;
        const cost = project.budget?.estimatedCost || 1;
        value = trees / cost;
        break;
      case 'biodiversity':
        value = project.species?.length || 0;
        break;
      case 'area':
        value = project.analytics?.areaCovered || 0;
        break;
      default:
        value = project.analytics?.totalTrees || 0;
    }
    
    return {
      projectId: project._id,
      projectName: project.name,
      value: parseFloat(value.toFixed(2)),
      status: project.status,
      location: project.location,
      speciesCount: project.species?.length || 0
    };
  });
  
  return comparativeData.sort((a, b) => b.value - a.value);
}

export default router;