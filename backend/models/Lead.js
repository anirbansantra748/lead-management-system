const mongoose = require('mongoose');

// Lead schema with all required fields as per assignment
const leadSchema = new mongoose.Schema({
  // Basic contact information
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ]
  },
  
  // Company and location details
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters']
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true,
    maxlength: [50, 'State name cannot exceed 50 characters']
  },
  
  // Lead classification and tracking
  source: {
    type: String,
    required: [true, 'Source is required'],
    enum: {
      values: ['website', 'facebook_ads', 'google_ads', 'referral', 'events', 'other'],
      message: 'Source must be one of: website, facebook_ads, google_ads, referral, events, other'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['new', 'contacted', 'qualified', 'lost', 'won'],
      message: 'Status must be one of: new, contacted, qualified, lost, won'
    },
    default: 'new'
  },
  
  // Scoring and value metrics
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score must be between 0 and 100'],
    max: [100, 'Score must be between 0 and 100'],
    default: 0
  },
  lead_value: {
    type: Number,
    required: [true, 'Lead value is required'],
    min: [0, 'Lead value must be a positive number'],
    default: 0
  },
  
  // Activity and qualification tracking
  last_activity_at: {
    type: Date,
    default: null
  },
  is_qualified: {
    type: Boolean,
    default: false
  },
  
  // User association - each lead belongs to a user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: { // This creates created_at and updated_at fields
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Indexes for better query performance
leadSchema.index({ user: 1, created_at: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ user: 1, email: 1 }, { unique: true }); // Compound unique constraint per user
leadSchema.index({ status: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ score: 1 });
leadSchema.index({ lead_value: 1 });
leadSchema.index({ is_qualified: 1 });
leadSchema.index({ last_activity_at: 1 });

// Virtual for full name
leadSchema.virtual('full_name').get(function() {
  return `${this.first_name} ${this.last_name}`;
});

// Ensure virtual fields are serialized
leadSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to update last_activity_at when status changes
leadSchema.pre('save', function(next) {
  // If status is being modified and it's not 'new', update last_activity_at
  if (this.isModified('status') && this.status !== 'new' && !this.last_activity_at) {
    this.last_activity_at = new Date();
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);