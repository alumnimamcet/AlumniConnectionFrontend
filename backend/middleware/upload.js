const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Helper: Ensure directory exists ─────────────────────────
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

// ─── Directory paths ──────────────────────────────────────────
const postsDir    = path.join(__dirname, '../uploads/posts');
const profilesDir = path.join(__dirname, '../uploads/profiles');
const bannersDir  = path.join(__dirname, '../uploads/banners');
const videosDir   = path.join(__dirname, '../uploads/videos');

[postsDir, profilesDir, bannersDir, videosDir].forEach(ensureDir);

// ─── Unique filename helper ───────────────────────────────────
const uniqueName = (prefix, file) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    return `${prefix}-${suffix}${path.extname(file.originalname)}`;
};

// ─── Storage engines ──────────────────────────────────────────
const postStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, postsDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        if (!ext && file.mimetype) {
            ext = '.' + file.mimetype.split('/')[1].replace('jpeg', 'jpg');
        }
        cb(null, uniqueSuffix + ext);
    }
});

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, profilesDir),
    filename: (req, file, cb) => {
        // Use userId in filename for easy identification & overwrite-style naming
        const userId = req.user?._id?.toString() || 'unknown';
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = path.extname(file.originalname);
        if (!ext && file.mimetype) {
            ext = '.' + file.mimetype.split('/')[1].replace('jpeg', 'jpg');
        }
        cb(null, `profile-${userId}-${uniqueSuffix}${ext}`);
    }
});

const bannerStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, bannersDir),
    filename:    (req, file, cb) => {
        const userId = req.user?._id?.toString() || 'u';
        cb(null, `banner-${userId}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videosDir),
    filename:    (req, file, cb) => cb(null, uniqueName('video', file))
});

// ─── File filters ─────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    cb(new Error('Only image files are allowed.'), false);
};

const videoFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) return cb(null, true);
    cb(new Error('Only video files are allowed.'), false);
};

// ─── Multer instances ─────────────────────────────────────────
const postUpload = multer({
    storage: postStorage,
    limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
    fileFilter: imageFilter
});

const profileUpload = multer({
    storage: profileStorage,
    limits: { fileSize: 3 * 1024 * 1024 },   // 3 MB
    fileFilter: imageFilter
});

const bannerUpload = multer({
    storage: bannerStorage,
    limits: { fileSize: 5 * 1024 * 1024 },   // 5 MB
    fileFilter: imageFilter
});

const videoUpload = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: videoFilter
});

module.exports = { postUpload, profileUpload, bannerUpload, videoUpload };
