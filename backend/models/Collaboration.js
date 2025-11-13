import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permissions: {
    canEdit: {
      type: Boolean,
      default: false
    },
    canInvite: {
      type: Boolean,
      default: false
    },
    canManage: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

collaborationSchema.index({ project: 1, team: 1 }, { unique: true });
collaborationSchema.index({ team: 1 });

export default mongoose.model('Collaboration', collaborationSchema);