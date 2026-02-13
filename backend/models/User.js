import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      units: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        projectUpdates: {
          type: Boolean,
          default: true,
        },
        teamActivities: {
          type: Boolean,
          default: true,
        },
        chatMessages: {
          type: Boolean,
          default: true,
        }
      },
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    teams: [
      {
        team: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
        },
        role: {
          type: String,
          enum: ['admin', 'manager', 'member', 'viewer'],
          default: 'member'
        },
        joinedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    savedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      }
    ],
    savedLocations: [
      {
        lat: Number,
        lon: Number,
        name: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    location: {
      country: String,
      region: String,
      city: String
    },
    expertise: [String],
    socialLinks: {
      website: String,
      twitter: String,
      linkedin: String
    }
  },
  {
    timestamps: true,
  }
);

// Password hashing hook
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password') || !user.password) {
    return next();
  }

  try {
    user.password = await bcrypt.hash(String(user.password), 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(String(candidatePassword), this.password);
};

// Method to get public user profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.googleId;
  return user;
};

// Method to get community profile (includes bio, expertise, etc.)
userSchema.methods.getCommunityProfile = function () {
  const profile = this.getPublicProfile();
  return {
    ...profile,
    bio: this.bio,
    location: this.location,
    expertise: this.expertise,
    socialLinks: this.socialLinks,
    stats: {
      projects: this.projects.length,
      teams: this.teams.length
    }
  };
};

// Team management methods
userSchema.methods.addToTeam = function(teamId, role = 'member') {
  const existingTeam = this.teams.find(t => t.team.toString() === teamId.toString());
  if (!existingTeam) {
    this.teams.push({
      team: teamId,
      role
    });
  }
  return this.save();
};

userSchema.methods.removeFromTeam = function(teamId) {
  this.teams = this.teams.filter(t => t.team.toString() !== teamId.toString());
  return this.save();
};

userSchema.methods.updateTeamRole = function(teamId, newRole) {
  const team = this.teams.find(t => t.team.toString() === teamId.toString());
  if (team) {
    team.role = newRole;
  }
  return this.save();
};

// Static method to find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({ verificationToken: token });
};

// Indexes
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ verificationToken: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'teams.team': 1 });
userSchema.index({ expertise: 1 });
userSchema.index({ 'location.country': 1 });

export default mongoose.model('User', userSchema);