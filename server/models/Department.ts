import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  websiteUrl?: string;
  headOfDepartment?: string;
  address?: string;
  responseTimeSla?: number; // Hours
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  websiteUrl: {
    type: String,
    trim: true
  },
  headOfDepartment: {
    type: String,
    trim: true,
    maxlength: 255
  },
  address: {
    type: String,
    trim: true
  },
  responseTimeSla: {
    type: Number,
    min: 1,
    max: 720, // 30 days max
    default: 72 // 3 days default
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
departmentSchema.index({ name: 1 });
departmentSchema.index({ isActive: 1 });
departmentSchema.index({ email: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema); 