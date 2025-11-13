import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'invited'],
      default: 'active'
    }
  }],
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  settings: {
    public: {
      type: Boolean,
      default: false
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    joinRequests: {
      type: Boolean,
      default: true
    }
  },
  avatar: {
    type: String,
    default: null
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ tags: 1 });
teamSchema.index({ createdAt: -1 });

// Methods
teamSchema.methods.addMember = function(userId, role = 'member', status = 'active') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role,
      status
    });
  }
  
  return this.save();
};

teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  return this.save();
};

teamSchema.methods.updateMemberRole = function(userId, newRole) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (member) {
    member.role = newRole;
  }
  
  return this.save();
};

teamSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString() && member.status === 'active'
  );
};

teamSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member && (member.role === 'admin' || this.owner.toString() === userId.toString());
};

export default mongoose.model('Team', teamSchema);