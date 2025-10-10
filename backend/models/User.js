// backend/models/User.js
import mongoose from 'mongoose';

// Define schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // This already creates an index
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
      default: null, // Only for email/password users, null for OAuth
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


// ✅ Keep only these indexes (no duplicate email index)
userSchema.index({ googleId: 1 });
userSchema.index({ verificationToken: 1 });

// Method to get public user profile (hide sensitive fields)
userSchema.methods.getPublicProfile = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  delete user.googleId;
  return user;
};

// Export model
const User = mongoose.model('User', userSchema);
export default User;
