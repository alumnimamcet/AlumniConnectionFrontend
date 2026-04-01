const express  = require('express');
const multer   = require('multer');
const XLSX     = require('xlsx');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { sendApprovalEmail }  = require('../services/emailService');

const router = express.Router();

// ── multer (memory storage for xlsx/csv parsing) ──────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ok = /\.(xlsx|xls|csv)$/i.test(file.originalname);
    cb(ok ? null : new Error('Only .xlsx, .xls or .csv files are allowed.'), ok);
  },
});

// ════════════════════════════════════════════════════════════════
//  STUDENT CRUD
// ════════════════════════════════════════════════════════════════

// ─── GET /api/admin/students ──────────────────────────────────
router.get('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      search = '',
      department = '',
      batch = '',
      graduationYear = '',
      page  = 1,
      limit = 10,
      sort  = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { role: 'student' };

    if (search.trim()) {
      query.$or = [
        { name:  { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }
    if (department)    query.department    = department;
    if (batch)         query.batch         = batch;
    if (graduationYear) query.graduationYear = graduationYear;

    const skip    = (Number(page) - 1) * Number(limit);
    const sortDir = order === 'asc' ? 1 : -1;

    const [students, total] = await Promise.all([
      User.find(query)
        .select('-password -secretKey -otp -otpExpiry -connections')
        .sort({ [sort]: sortDir })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    const [departments, batches, gradYears] = await Promise.all([
      User.distinct('department',    { role: 'student', department:    { $exists: true, $ne: '' } }),
      User.distinct('batch',         { role: 'student', batch:         { $exists: true, $ne: '' } }),
      User.distinct('graduationYear',{ role: 'student', graduationYear:{ $exists: true, $ne: '' } }),
    ]);

    res.json({
      success: true,
      data: students,
      pagination: {
        total, page: Number(page), limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      filters: {
        departments:    departments.sort(),
        batches:        batches.sort(),
        graduationYears:gradYears.sort(),
      },
    });
  } catch (err) {
    console.error('[GET /students]', err);
    res.status(500).json({ message: 'Failed to fetch students.' });
  }
});

// ─── POST /api/admin/students ─────────────────────────────────
// Add a single student (auto-generates password = roll number or email prefix)
router.post('/students', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      name, email, phone, department, batch,
      graduationYear, rollNumber, gender,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required.' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'A user with this email already exists.' });

    const rawPass  = rollNumber || email.split('@')[0];
    const hashed   = await bcrypt.hash(rawPass, 12);

    const student = await User.create({
      name, email: email.toLowerCase().trim(),
      password: hashed, phone, department,
      batch, graduationYear, rollNumber, gender,
      role: 'student', status: 'Active',
    });

    res.status(201).json({
      success: true,
      data: { ...student.toObject(), password: undefined },
      message: `Student ${name} added. Default password: "${rawPass}"`,
    });
  } catch (err) {
    console.error('[POST /students]', err);
    res.status(500).json({ message: err.message || 'Failed to add student.' });
  }
});

// ─── PUT /api/admin/students/:id ─────────────────────────────
router.put('/students/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const allowed = [
      'name','email','phone','department','batch',
      'graduationYear','rollNumber','gender','city','status',
    ];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -secretKey -otp -otpExpiry');

    if (!user) return res.status(404).json({ message: 'Student not found.' });
    res.json({ success: true, data: user, message: 'Student updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update student.' });
  }
});

// ─── DELETE /api/admin/students/:id ──────────────────────────
router.delete('/students/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!user) return res.status(404).json({ message: 'Student not found.' });
    res.json({ success: true, message: `${user.name}'s account deleted.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete student.' });
  }
});

// ─── PUT /api/admin/students/:id/promote ─────────────────────
// Promote a student → alumni (changes role, clears student-only fields)
router.put('/students/:id/promote', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    // Use graduation year as pass-out batch if available
    student.role   = 'alumni';
    student.status = 'Active';
    if (student.graduationYear && !student.batch) {
      student.batch = student.graduationYear;
    }
    await student.save();

    // Notify the user
    await Notification.create({
      userId: student._id,
      type: 'role_changed',
      title: '🎓 Congratulations! You\'ve been promoted to Alumni!',
      description: 'Your account has been upgraded. Welcome to the MAMCET Alumni network!',
      icon: '🎓',
    });

    res.json({ success: true, message: `${student.name} promoted to alumni!` });
  } catch (err) {
    console.error('[PUT /students/:id/promote]', err);
    res.status(500).json({ message: 'Failed to promote student.' });
  }
});

// ─── POST /api/admin/students/bulk-import ────────────────────
// Accept .xlsx / .xls / .csv, parse rows, create students in bulk
router.post('/students/bulk-import', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    // Parse workbook
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    const rows     = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) return res.status(400).json({ message: 'File is empty or unreadable.' });

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      const name  = (row['Name'] || row['name'] || '').toString().trim();
      const email = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
      const dept  = (row['Department'] || row['department'] || '').toString().trim();
      const batch = (row['Batch'] || row['batch'] || row['Join Year'] || '').toString().trim();
      const gradY = (row['Graduation Year'] || row['graduationYear'] || row['Expected Graduation'] || '').toString().trim();
      const roll  = (row['Roll Number'] || row['rollNumber'] || row['Roll'] || '').toString().trim();
      const phone = (row['Phone'] || row['phone'] || '').toString().trim();
      const gen   = (row['Gender'] || row['gender'] || '').toString().trim();

      if (!name || !email) {
        results.errors.push({ row: name || email || '?', reason: 'Missing name or email' });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) {
        results.skipped++;
        continue;
      }

      try {
        const rawPass = roll || email.split('@')[0];
        const hashed  = await bcrypt.hash(rawPass, 10);
        await User.create({
          name, email, password: hashed, phone,
          department: dept, batch, graduationYear: gradY,
          rollNumber: roll, gender: gen,
          role: 'student', status: 'Active',
        });
        results.created++;
      } catch (e) {
        results.errors.push({ row: email, reason: e.message });
      }
    }

    res.json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped (duplicates), ${results.errors.length} errors.`,
      results,
    });
  } catch (err) {
    console.error('[POST /students/bulk-import]', err);
    res.status(500).json({ message: err.message || 'Bulk import failed.' });
  }
});

// ─── POST /api/admin/alumni/bulk-import ──────────────────────
router.post('/alumni/bulk-import', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    const rows     = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) return res.status(400).json({ message: 'File is empty or unreadable.' });

    const results = { created: 0, skipped: 0, errors: [] };

    for (const row of rows) {
      const name  = (row['Name'] || row['name'] || '').toString().trim();
      const email = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
      const dept  = (row['Department'] || row['department'] || '').toString().trim();
      const batch = (row['Batch'] || row['batch'] || row['Pass Out Year'] || row['Year'] || row['year'] || '').toString().trim();
      const comp  = (row['Company'] || row['company'] || '').toString().trim();
      const desig = (row['Designation'] || row['designation'] || '').toString().trim();
      const phone = (row['Phone'] || row['phone'] || '').toString().trim();
      const gen   = (row['Gender'] || row['gender'] || '').toString().trim();

      if (!name || !email) {
        results.errors.push({ row: name || email || '?', reason: 'Missing name or email' });
        continue;
      }

      const exists = await User.findOne({ email });
      if (exists) { results.skipped++; continue; }

      try {
        const rawPass = email.split('@')[0];
        const hashed  = await bcrypt.hash(rawPass, 10);
        const alumni  = await User.create({
          name, email, password: hashed, phone, gender: gen,
          department: dept, batch, company: comp, designation: desig,
          role: 'alumni', status: 'Pending',
        });
        // Notify admin-side (no user notification needed at import)
        results.created++;
      } catch (e) {
        results.errors.push({ row: email, reason: e.message });
      }
    }

    res.json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped (duplicates), ${results.errors.length} errors.`,
      results,
    });
  } catch (err) {
    console.error('[POST /alumni/bulk-import]', err);
    res.status(500).json({ message: err.message || 'Bulk import failed.' });
  }
});

// ─── POST /api/admin/import ───────────────────────────────────
// Unified import endpoint — role determined by ?type=student|alumni
// Supports dry-run mode: ?preview=true → validates & returns rows without writing to DB
router.post('/import', protect, authorize('admin'), upload.single('file'), async (req, res) => {
  try {
    const { type = 'student', preview = 'false' } = req.query;
    const isDryRun = preview === 'true';

    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    if (!['student','alumni'].includes(type)) {
      return res.status(400).json({ message: 'type must be "student" or "alumni".' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    const raw      = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!raw.length) return res.status(400).json({ message: 'File is empty or has no rows.' });

    // ── Normalise each row ──────────────────────────────────
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const normalised = raw.map((row, idx) => {
      const name  = (row['Name']  || row['name']  || '').toString().trim();
      const email = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
      const dept  = (row['Department'] || row['department'] || '').toString().trim();
      const year  = (
        row['Year'] || row['year'] ||
        (type === 'student'
          ? (row['Batch'] || row['batch'] || row['Join Year'] || '')
          : (row['Batch'] || row['batch'] || row['Pass Out Year'] || ''))
      ).toString().trim();
      const gradY = (row['Graduation Year'] || row['graduationYear'] || row['Expected Graduation'] || '').toString().trim();
      const roll  = (row['Roll Number'] || row['rollNumber'] || row['Roll'] || '').toString().trim();
      const comp  = (row['Company'] || row['company'] || '').toString().trim();
      const desig = (row['Designation'] || row['designation'] || '').toString().trim();
      const phone = (row['Phone'] || row['phone'] || '').toString().trim();
      const gen   = (row['Gender'] || row['gender'] || '').toString().trim();

      // ── per-row validation ──────────────────────────────
      const errors = [];
      if (!name)               errors.push('Name is required');
      if (!email)              errors.push('Email is required');
      else if (!EMAIL_RE.test(email)) errors.push('Invalid email format');

      return {
        _row: idx + 2, // spreadsheet row number (1-indexed header + 1)
        name, email, department: dept, year, graduationYear: gradY,
        rollNumber: roll, company: comp, designation: desig,
        phone, gender: gen,
        _valid: errors.length === 0,
        _errors: errors,
      };
    });

    // ── If preview mode → return normalised data only ────
    if (isDryRun) {
      return res.json({
        success: true,
        rows: normalised,
        totalRows: normalised.length,
        validRows: normalised.filter(r => r._valid).length,
        invalidRows: normalised.filter(r => !r._valid).length,
      });
    }

    // ── Full import ────────────────────────────────────────
    const results = { created: 0, skipped: 0, errors: [] };

    for (const r of normalised) {
      if (!r._valid) {
        results.errors.push({ row: r.email || `Row ${r._row}`, reason: r._errors.join('; ') });
        continue;
      }

      const exists = await User.findOne({ email: r.email });
      if (exists) { results.skipped++; continue; }

      try {
        const rawPass = type === 'student'
          ? (r.rollNumber || r.email.split('@')[0])
          : r.email.split('@')[0];
        const hashed = await bcrypt.hash(rawPass, 10);

        await User.create({
          name: r.name, email: r.email, password: hashed,
          phone: r.phone, gender: r.gender, department: r.department,
          batch: r.year,
          ...(type === 'student'
            ? { graduationYear: r.graduationYear, rollNumber: r.rollNumber, role: 'student', status: 'Active' }
            : { company: r.company, designation: r.designation, role: 'alumni', status: 'Pending' }),
        });
        results.created++;
      } catch (e) {
        results.errors.push({ row: r.email, reason: e.message });
      }
    }

    res.json({
      success: true,
      message: `Import complete: ${results.created} created, ${results.skipped} skipped, ${results.errors.length} errors.`,
      results,
    });
  } catch (err) {
    console.error('[POST /import]', err);
    res.status(500).json({ message: err.message || 'Import failed.' });
  }
});

// ─── GET /api/admin/alumni ────────────────────────────────────
// Full list with search, filter by dept/batch/status, pagination
router.get('/alumni', protect, authorize('admin'), async (req, res) => {

  try {
    const {
      search = '',
      department = '',
      batch = '',
      status = '',
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = { role: 'alumni' };

    // Search by name or email
    if (search.trim()) {
      query.$or = [
        { name:  { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (department) query.department = department;
    if (batch)      query.batch      = batch;
    if (status)     query.status     = status;

    const skip     = (Number(page) - 1) * Number(limit);
    const sortDir  = order === 'asc' ? 1 : -1;
    const sortObj  = { [sort]: sortDir };

    const [alumni, total] = await Promise.all([
      User.find(query)
        .select('-password -secretKey -otp -otpExpiry -connections')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    // Also return distinct dept + batch lists for filter dropdowns
    const [departments, batches] = await Promise.all([
      User.distinct('department', { role: 'alumni', department: { $exists: true, $ne: '' } }),
      User.distinct('batch',      { role: 'alumni', batch:       { $exists: true, $ne: '' } }),
    ]);

    res.json({
      success: true,
      data: alumni,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
      filters: {
        departments: departments.sort(),
        batches:     batches.sort(),
      },
    });
  } catch (err) {
    console.error('[GET /alumni]', err);
    res.status(500).json({ message: 'Failed to fetch alumni.' });
  }
});

// ─── PUT /api/admin/alumni/:id ────────────────────────────────
// Edit an alumni's name, email, department, batch, company, designation, status
router.put('/alumni/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const allowed = ['name', 'email', 'phone', 'department', 'batch', 'company',
                     'designation', 'presentStatus', 'city', 'state', 'status'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -secretKey -otp -otpExpiry');

    if (!user) return res.status(404).json({ message: 'Alumni not found.' });
    res.json({ success: true, data: user, message: 'Alumni updated.' });
  } catch (err) {
    console.error('[PUT /alumni/:id]', err);
    res.status(500).json({ message: 'Failed to update alumni.' });
  }
});

// ─── DELETE /api/admin/alumni/:id ────────────────────────────
// Permanently delete an alumni account
router.delete('/alumni/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'alumni' });
    if (!user) return res.status(404).json({ message: 'Alumni not found.' });
    res.json({ success: true, message: `${user.name}'s account has been deleted.` });
  } catch (err) {
    console.error('[DELETE /alumni/:id]', err);
    res.status(500).json({ message: 'Failed to delete alumni.' });
  }
});

// ─── PUT /api/admin/reject-alumni/:userId ────────────────────
// Set status to Pending (un-approve) — leaves the record intact
router.put('/reject-alumni/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'Pending' },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, message: `${user.name}'s account has been set to Pending.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status.' });
  }
});

// ─── GET /api/admin/pending-alumni ───────────────────────────
router.get('/pending-alumni', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingAlumni = await User.find({ role: 'alumni', status: 'Pending' })
      .select('-password -secretKey -otp -otpExpiry')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: pendingAlumni });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending alumni.' });
  }
});

// ─── PUT /api/admin/activate/:userId ─────────────────────────
router.put('/activate/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.status === 'Active') return res.status(400).json({ message: 'Account already active.' });

    user.status = 'Active';
    await user.save();

    // Notify the alumni their account was approved
    await Notification.create({
      userId: user._id,
      type: 'account_activated',
      title: '🎉 Your account has been approved!',
      description: 'Welcome to MAMCET Alumni Connect! You can now log in and explore.',
      icon: '🎉',
    });

    // Send approval email
    try { await sendApprovalEmail(user.email, user.name); } catch (_) {}

    res.json({ success: true, message: `${user.name} has been activated.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to activate user.' });
  }
});

// ─── DELETE /api/admin/reject/:userId ────────────────────────
router.delete('/reject/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ success: true, message: `${user.name}'s application has been rejected and removed.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject user.' });
  }
});

// ─── GET /api/admin/stats ─────────────────────────────────────
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const Job = require('../models/Job');
    const Event = require('../models/Event');
    const [totalUsers, pendingAlumni, pendingJobs, pendingEvents, totalPosts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'alumni', status: 'Pending' }),
      Job.countDocuments({ status: 'Pending' }),
      Event.countDocuments({ status: 'Pending' }),
      require('../models/Post').countDocuments()
    ]);
    res.json({ success: true, data: { totalUsers, pendingAlumni, pendingJobs, pendingEvents, totalPosts } });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/admin/pending-events ───────────────────────────
// (Alias — mirrors GET /api/events/pending for admin convenience)
router.get('/pending-events', protect, authorize('admin'), async (req, res) => {
  try {
    const Event = require('../models/Event');
    const events = await Event.find({ status: 'Pending' })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending events.' });
  }
});

// ─── PUT /api/admin/approve-event/:id ────────────────────────
// Alias for PUT /api/events/:id/approve — keeps Admin route prefix consistent
router.put('/approve-event/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const Event = require('../models/Event');
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    try {
      const recipients = await User.find({ role: { $in: ['student', 'alumni'] } }).select('_id');
      const notifDocs = recipients.map(u => ({
        userId: u._id,
        type: 'event_alert',
        title: `New Event: ${event.title}`,
        description: `${event.date || ''} at ${event.venue || 'TBD'}`,
        icon: '📅',
        relatedId: event._id
      }));
      const created = await Notification.insertMany(notifDocs);
      const io = req.app.get('io');
      if (io) {
        created.forEach((notif, i) => {
          io.to(recipients[i]._id.toString()).emit('notification_received', notif);
        });
      }
    } catch (_) {}

    res.json({ success: true, message: 'Event approved.', data: event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to approve event.' });
  }
});

// ─── PUT /api/admin/reject-event/:id ─────────────────────────
router.put('/reject-event/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const Event = require('../models/Event');
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ success: true, message: 'Event rejected and removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject event.' });
  }
});

module.exports = router;

