const express = require('express');
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { profileUpload, bannerUpload } = require('../middleware/upload');

const router = express.Router();

// ─── PUT /api/users/upload-dp ─────────────────────────────────
// Upload / replace the logged-in user's profile picture
router.put(
    '/upload-dp',
    protect,
    profileUpload.single('profilePic'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No image file provided.' });
            }

            // Build a URL-friendly path relative to the server root
            const filePath = `/uploads/profiles/${req.file.filename}`;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { profilePic: filePath },
                { new: true, select: '-password -secretKey' }
            );

            if (!user) return res.status(404).json({ message: 'User not found.' });

            res.json({
                success: true,
                message: 'Profile picture updated.',
                profilePic: filePath,
                user: user.toSafeObject ? user.toSafeObject() : user
            });
        } catch (err) {
            console.error('Upload DP error:', err);
            res.status(500).json({ message: err.message || 'Failed to upload profile picture.' });
        }
    }
);

// ─── PUT /api/users/upload-banner ────────────────────────────
// Upload / replace the logged-in user's banner picture
router.put(
    '/upload-banner',
    protect,
    bannerUpload.single('bannerPic'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No image file provided.' });
            }

            const filePath = `/uploads/banners/${req.file.filename}`;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { bannerPic: filePath },
                { new: true, select: '-password -secretKey' }
            );

            if (!user) return res.status(404).json({ message: 'User not found.' });

            res.json({
                success: true,
                message: 'Banner picture updated.',
                bannerPic: filePath,
                user: user.toSafeObject ? user.toSafeObject() : user
            });
        } catch (err) {
            console.error('Upload Banner error:', err);
            res.status(500).json({ message: err.message || 'Failed to upload banner picture.' });
        }
    }
);

// ─── GET /api/users/:id ───────────────────────────────────────
// Fetch any user's public profile by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -secretKey -otp -otpExpiry');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user.' });
    }
});

module.exports = router;
