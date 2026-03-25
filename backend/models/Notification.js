const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Primary recipient reference — used for all queries
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  // Semantic alias for clarity (kept in sync via pre-save hook)
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  type: {
    type: String,
    enum: [
      'event', 'job', 'message', 'system',
      'connection_request', 'connection_accepted',
      'job_alert', 'event_alert',
      'admin_approval_needed', 'account_activated'
    ],
    required: true
  },
  title: { type: String, required: true },
  description: String,
  icon: { type: String, default: '🔔' },
  relatedId: { type: mongoose.Schema.Types.ObjectId },  // ID of the related job/event
  isRead: { type: Boolean, default: false },
  // Extra fields matching current data shape
  company: String,   // for job notifications
  posted: String,    // for job notifications
  date: String,      // for event notifications
}, {
  timestamps: true
});

// Keep recipientId in sync with userId automatically
notificationSchema.pre('save', function (next) {
  if (this.isModified('userId') || this.isNew) {
    this.recipientId = this.userId;
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
