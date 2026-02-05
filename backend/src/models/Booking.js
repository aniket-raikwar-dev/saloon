import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      // Auto-generated in pre-save hook
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    // Denormalized user data for quick access
    userName: {
      type: String,
      required: true,
    },
    userPhone: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    }],
    // Denormalized service names for quick display
    serviceNames: [{
      type: String,
    }],
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    time: {
      type: String,
      required: [true, 'Booking time is required'],
      // e.g., "09:00 AM", "02:30 PM"
    },
    // Combined date and time for sorting/querying
    scheduledAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // Admin who confirmed/processed the booking
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'admin'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted date
bookingSchema.virtual('formattedDate').get(function () {
  return this.date?.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
});

// Virtual for formatted amount
bookingSchema.virtual('formattedAmount').get(function () {
  return `₹${this.totalAmount.toLocaleString()}`;
});

// Pre-save hook to generate booking ID
bookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingId) {
    const count = await mongoose.model('Booking').countDocuments();
    this.bookingId = `BK-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Set scheduledAt by combining date and time
  if (this.date && this.time) {
    const [time, period] = this.time.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    const scheduledDate = new Date(this.date);
    scheduledDate.setHours(hours, minutes, 0, 0);
    this.scheduledAt = scheduledDate;
  }
  
  next();
});

// Index for better query performance
// Note: bookingId already has an index due to unique: true
bookingSchema.index({ user: 1, date: -1 });
bookingSchema.index({ status: 1, date: 1 });
bookingSchema.index({ date: 1, time: 1 });
bookingSchema.index({ scheduledAt: 1 });

// Static method to get bookings by user
bookingSchema.statics.getByUser = function (userId) {
  return this.find({ user: userId })
    .populate('services')
    .sort({ createdAt: -1 });
};

// Static method to get bookings by status
bookingSchema.statics.getByStatus = function (status) {
  return this.find({ status })
    .populate('user', 'name email phone avatar')
    .populate('services')
    .sort({ scheduledAt: 1 });
};

// Static method to get today's bookings
bookingSchema.statics.getToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    date: { $gte: today, $lt: tomorrow },
    status: { $in: ['pending', 'confirmed'] },
  })
    .populate('user', 'name email phone avatar')
    .populate('services')
    .sort({ time: 1 });
};

// Static method to get upcoming bookings
bookingSchema.statics.getUpcoming = function (limit = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.find({
    date: { $gte: today },
    status: { $in: ['pending', 'confirmed'] },
  })
    .populate('user', 'name email phone avatar')
    .populate('services')
    .sort({ scheduledAt: 1 })
    .limit(limit);
};

// Static method to get booking stats
bookingSchema.statics.getStats = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [stats] = await this.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
        confirmed: [{ $match: { status: 'confirmed' } }, { $count: 'count' }],
        completed: [{ $match: { status: 'completed' } }, { $count: 'count' }],
        cancelled: [{ $match: { status: 'cancelled' } }, { $count: 'count' }],
        today: [
          { $match: { date: { $gte: today, $lt: tomorrow }, status: { $in: ['pending', 'confirmed'] } } },
          { $count: 'count' },
        ],
        totalRevenue: [
          { $match: { status: 'completed' } },
          { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
        ],
        upcomingRevenue: [
          { $match: { status: { $in: ['pending', 'confirmed'] }, date: { $gte: today } } },
          { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
        ],
      },
    },
  ]);
  
  return {
    totalBookings: stats.total[0]?.count || 0,
    pendingBookings: stats.pending[0]?.count || 0,
    confirmedBookings: stats.confirmed[0]?.count || 0,
    completedBookings: stats.completed[0]?.count || 0,
    cancelledBookings: stats.cancelled[0]?.count || 0,
    todayBookings: stats.today[0]?.count || 0,
    totalRevenue: stats.totalRevenue[0]?.sum || 0,
    upcomingRevenue: stats.upcomingRevenue[0]?.sum || 0,
  };
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
