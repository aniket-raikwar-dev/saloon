import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['hair', 'skin', 'makeup', 'nails', 'spa'],
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      // e.g., "30 mins", "1 hr", "1.5 hrs"
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [15, 'Minimum duration is 15 minutes'],
    },
    icon: {
      type: String,
      default: '✨', // Emoji icon
    },
    image: {
      type: String, // Cloudinary URL for service image
      default: null,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0, // For custom ordering
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted price
serviceSchema.virtual('formattedPrice').get(function () {
  return `₹${this.price.toLocaleString()}`;
});

// Index for better query performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ isPopular: 1, isActive: 1 });
serviceSchema.index({ order: 1 });

// Static method to get services by category
serviceSchema.statics.getByCategory = function (category) {
  const query = { isActive: true };
  if (category && category !== 'all') {
    query.category = category.toLowerCase();
  }
  return this.find(query).sort({ order: 1, name: 1 });
};

// Static method to get popular services
serviceSchema.statics.getPopular = function (limit = 5) {
  return this.find({ isActive: true, isPopular: true })
    .sort({ order: 1 })
    .limit(limit);
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;
