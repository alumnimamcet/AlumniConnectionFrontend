const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// ─── GET /api/admin/analytics ─────────────────────────────────
// Full analytics payload for the admin dashboard
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    const Job   = require('../models/Job');
    const Event = require('../models/Event');
    const Post  = require('../models/Post');

    // ── KPI Counts ──────────────────────────────────────────────
    const [
      totalStudents,
      totalAlumni,
      activeUsers,
      pendingAlumni,
      pendingJobs,
      pendingEvents,
      totalPosts,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      User.countDocuments({ status: 'Active' }),
      User.countDocuments({ role: 'alumni', status: 'Pending' }),
      Job.countDocuments({ status: 'Pending' }),
      Event.countDocuments({ status: 'Pending' }),
      Post.countDocuments(),
    ]);

    const pendingApprovals = pendingAlumni + pendingJobs + pendingEvents;

    // ── Department-wise distribution ────────────────────────────
    const deptAgg = await User.aggregate([
      { $match: { role: { $in: ['alumni', 'student'] }, department: { $exists: true, $ne: '' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);
    const departmentDistribution = deptAgg.map(d => ({
      department: d._id || 'Unknown',
      count: d.count,
    }));

    // ── Year-wise alumni count ──────────────────────────────────
    const yearAgg = await User.aggregate([
      { $match: { role: 'alumni', batch: { $exists: true, $ne: '' } } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 10 },
    ]);
    const yearWiseAlumni = yearAgg.map(y => ({
      year: y._id || 'Unknown',
      count: y.count,
    }));

    // ── Recent Registrations (last 7) ───────────────────────────
    const recentRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .select('name role department batch status createdAt profilePic');

    // ── Recent Posts (last 5) ───────────────────────────────────
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name profilePic role')
      .select('content media createdAt author');

    // ── Recent Jobs (last 5) ─────────────────────────────────────
    const recentJobs = await Job.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('postedBy', 'name role')
      .select('title company status createdAt postedBy');

    res.json({
      success: true,
      data: {
        kpis: {
          totalStudents,
          totalAlumni,
          activeUsers,
          pendingApprovals,
          totalPosts,
        },
        departmentDistribution,
        yearWiseAlumni,
        recentActivity: {
          registrations: recentRegistrations,
          posts: recentPosts,
          jobs: recentJobs,
        },
      },
    });
  } catch (err) {
    console.error('[AdminAnalytics]', err);
    res.status(500).json({ message: 'Failed to fetch analytics data.' });
  }
});

module.exports = router;
