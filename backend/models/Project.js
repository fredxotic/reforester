import mongoose from 'mongoose';
import { CO2_PER_TREE_KG_YEAR } from '../constants/environment.js';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    coordinates: {
      lat: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      lon: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },
    address: String,
    region: String,
    country: String
  },
  environmentalData: {
    soil: {
      clay: Number,
      sand: Number,
      silt: Number,
      source: String
    },
    weather: {
      temperature: Number,
      precipitation: Number,
      maxTemperature: Number,
      minTemperature: Number,
      source: String
    },
    biome: String,
    analysisTimestamp: Date
  },
  species: [{
    name: {
      type: String,
      required: true
    },
    scientificName: String,
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    spacing: {
      type: Number, // meters between trees
      default: 5
    },
    survivalRate: {
      type: Number, // percentage
      default: 85,
      min: 0,
      max: 100
    },
    plantingDate: Date,
    notes: String
  }],
  timeline: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    milestones: [{
      name: String,
      description: String,
      targetDate: Date,
      completed: {
        type: Boolean,
        default: false
      },
      completedDate: Date
    }]
  },
  budget: {
    estimatedCost: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    actualCost: Number,
    fundingSource: String,
    expenses: [{
      description: String,
      amount: Number,
      date: Date,
      category: {
        type: String,
        enum: ['saplings', 'labor', 'equipment', 'maintenance', 'other']
      }
    }]
  },
  analytics: {
    totalTrees: Number,
    areaCovered: Number, // hectares
    estimatedCarbonSequestration: Number, // tons CO2 per year
    biodiversityScore: Number, // 0-100 scale
    survivalRate: Number, // percentage
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  visibility: {
    type: String,
    enum: ['private', 'team', 'public'],
    default: 'private'
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['manager', 'contributor', 'viewer'],
      default: 'contributor'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  collaborations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collaboration'
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String]
}, {
  timestamps: true
});

// Indexes for better query performance
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ status: 1 });
projectSchema.index({ 'location.coordinates': '2dsphere' });
projectSchema.index({ tags: 1 });

// Virtual for calculating project age
projectSchema.virtual('ageInMonths').get(function() {
  const now = new Date();
  const start = this.timeline.startDate;
  const diffTime = Math.abs(now - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
});

// Pre-save middleware to calculate analytics
projectSchema.pre('save', function(next) {
  // Calculate total trees
  this.analytics.totalTrees = this.species.reduce((total, species) => {
    return total + species.quantity;
  }, 0);

  // Calculate area covered (simplified calculation)
  if (this.species.length > 0) {
    const avgSpacing = this.species.reduce((sum, species) => sum + species.spacing, 0) / this.species.length;
    this.analytics.areaCovered = (this.analytics.totalTrees * Math.pow(avgSpacing, 2)) / 10000; // Convert to hectares
  }

  // Calculate estimated carbon sequestration (simplified)
  this.analytics.estimatedCarbonSequestration = (this.analytics.totalTrees * CO2_PER_TREE_KG_YEAR) / 1000; // Convert to tons

  // Calculate overall survival rate
  const totalSurvival = this.species.reduce((sum, species) => {
    return sum + (species.quantity * (species.survivalRate / 100));
  }, 0);
  this.analytics.survivalRate = (totalSurvival / this.analytics.totalTrees) * 100;

  next();
});

// Method to add a team member
projectSchema.methods.addTeamMember = function(userId, role = 'contributor') {
  const existingMember = this.teamMembers.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.teamMembers.push({
      user: userId,
      role: role
    });
  }
  
  return this.save();
};

// Method to remove a team member
projectSchema.methods.removeTeamMember = function(userId) {
  this.teamMembers = this.teamMembers.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Method to update progress based on milestones
projectSchema.methods.updateProgress = function() {
  if (this.timeline.milestones.length === 0) {
    this.analytics.progress = 0;
    return;
  }

  const completedMilestones = this.timeline.milestones.filter(milestone => milestone.completed).length;
  this.analytics.progress = (completedMilestones / this.timeline.milestones.length) * 100;
  
  return this.save();
};

// Static method to get projects by status
projectSchema.statics.getByStatus = function(status) {
  return this.find({ status }).populate('owner', 'name email avatar');
};

// Static method to get nearby projects
projectSchema.statics.getNearby = function(lat, lon, maxDistance = 50000) { // 50km default
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        $maxDistance: maxDistance
      }
    },
    visibility: { $in: ['public', 'team'] }
  }).populate('owner', 'name email avatar');
};

export default mongoose.model('Project', projectSchema);