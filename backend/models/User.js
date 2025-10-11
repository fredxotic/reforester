import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // This automatically creates an index
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
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      // REMOVE 'sparse: true' from here - it should only be in the index definition below
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
      },
    },
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
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
  },
  {
    timestamps: true,
  }
);

// ONLY define indexes that aren't automatically created by 'unique'
userSchema.index({ googleId: 1 }, { sparse: true }); // This allows multiple null googleIds
userSchema.index({ verificationToken: 1 });
userSchema.index({ createdAt: -1 });

// Method to get public user profile
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.googleId;
  return user;
};

// Static method to find user by email (case-insensitive)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

// Static method to find user by verification token
userSchema.statics.findByVerificationToken = function(token) {
  return this.findOne({ verificationToken: token });
};

export default mongoose.model('User', userSchema);