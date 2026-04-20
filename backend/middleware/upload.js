/**
 * middleware/upload.js — AWS S3 + Sharp media upload system.
 *
 * Replaces Cloudinary entirely. All media is now stored in S3.
 * Existing Cloudinary URLs already in the database continue to work —
 * S3 and Cloudinary URLs are both plain HTTPS URLs and render identically.
 *
 * Exports (same API surface as the former Cloudinary-backed version):
 *
 *   postUpload      — multer instance for posts (images & videos, 15 MB)
 *   profileUpload   — multer instance for profile pictures (3 MB)
 *   bannerUpload    — multer instance for banners (5 MB)
 *   videoUpload     — multer instance for videos (100 MB)
 *
 *   uploadToCloudinary(buffer, folder, resourceType, transforms)
 *     → Now uploads to S3.  Same call signature so routes don't change.
 *       The `transforms` param is intentionally ignored — transforms are
 *       applied server-side via Sharp presets keyed to the folder name.
 *
 *   uploadOptimized(buffer, folder, resourceType, transforms)
 *     → Sharp-compress then upload to S3.  Returns { url, optimized }.
 *
 *   optimizeImage(buffer) → compressed buffer (sharp, no S3 involved)
 */

const multer = require('multer');
const sharp  = require('sharp');
const s3     = require('../config/s3');
const path   = require('path');

// ─── Memory storage — files processed in RAM, never written to disk ──────────
const storage = multer.memoryStorage();

// ─── File type filters ────────────────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image files are allowed.'), false);
};

const videoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) return cb(null, true);
  cb(new Error('Only video files are allowed.'), false);
};

const mediaFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    return cb(null, true);
  }
  cb(new Error('Only image or video files are allowed.'), false);
};

// ─── Multer instances (same names, same limits as before) ─────────────────────
const postUpload    = multer({ storage, limits: { fileSize: 15  * 1024 * 1024 }, fileFilter: mediaFilter });
const profileUpload = multer({ storage, limits: { fileSize: 3   * 1024 * 1024 }, fileFilter: imageFilter });
const bannerUpload  = multer({ storage, limits: { fileSize: 5   * 1024 * 1024 }, fileFilter: imageFilter });
const videoUpload   = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 }, fileFilter: videoFilter });

// ─── Sharp image compression (standalone, unchanged API) ─────────────────────
const COMPRESSION_THRESHOLD = 300 * 1024; // 300 KB

const optimizeImage = async (fileBuffer) => {
  try {
    if (fileBuffer.length <= COMPRESSION_THRESHOLD) return fileBuffer;
    return await sharp(fileBuffer)
      .resize({ width: 1000, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
  } catch (err) {
    console.warn('[Sharp] Image optimization failed, using original:', err.message);
    return fileBuffer;
  }
};

// ─── Sharp presets — replaces Cloudinary server-side transforms ───────────────
// Cloudinary used to apply these on delivery.  We now bake them in before upload.
const applyImagePreset = async (buffer, folder) => {
  try {
    const base = sharp(buffer);
    if (folder.includes('profile_pictures')) {
      // Square crop, face-centred → 400 × 400 WebP
      return await base
        .resize(400, 400, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer();
    }
    if (folder.includes('banner')) {
      // Wide LinkedIn-ratio crop → 1584 × 396 WebP
      return await base
        .resize(1584, 396, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80 })
        .toBuffer();
    }
    if (folder.includes('mentorship_chat')) {
      // Chat images — constrain width, keep aspect ratio
      return await base
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();
    }
    // Posts and everything else — max-width 1200
    return await base
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
  } catch (err) {
    console.warn('[Sharp] Preset transform failed, using original buffer:', err.message);
    return buffer;
  }
};

// ─── Core S3 upload ───────────────────────────────────────────────────────────
/**
 * Upload a buffer directly to S3.
 * @param {Buffer} buffer       — file data
 * @param {string} folder       — S3 key prefix (e.g. 'alumni/posts')
 * @param {string} resourceType — 'image' | 'video'
 * @returns {Promise<string>}   — public HTTPS URL
 */
const uploadToS3 = (buffer, folder, resourceType = 'image') => {
  const ext         = resourceType === 'video' ? 'mp4' : 'webp';
  const uid         = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const key         = `${folder}/${uid}.${ext}`;
  const contentType = resourceType === 'video' ? 'video/mp4' : 'image/webp';

  return new Promise((resolve, reject) => {
    s3.upload(
      {
        Bucket:      process.env.AWS_BUCKET,
        Key:         key,
        Body:        buffer,
        ContentType: contentType,
        // ACL omitted — bucket uses policy-based public access (ACLs disabled)
      },
      (err, data) => {
        if (err) return reject(err);
        resolve(data.Location);
      }
    );
  });
};

// ─── uploadToCloudinary — SAME API, now routes to S3 ─────────────────────────
/**
 * Upload a buffer to S3 (replaces the Cloudinary stream version).
 *
 * The `transforms` parameter is kept for API compatibility but is intentionally
 * ignored — transforms are now applied server-side via applyImagePreset().
 *
 * @param {Buffer} buffer       — file buffer from multer memoryStorage
 * @param {string} folder       — storage folder / key prefix
 * @param {string} resourceType — 'image' or 'video'
 * @param {Object} transforms   — (ignored, kept for call-site compatibility)
 * @returns {Promise<string>}   — secure HTTPS URL
 */
const uploadToCloudinary = async (buffer, folder, resourceType = 'image', transforms = {}) => {
  try {
    let finalBuffer = buffer;
    if (resourceType === 'image') {
      finalBuffer = await applyImagePreset(buffer, folder);
    }
    return await uploadToS3(finalBuffer, folder, resourceType);
  } catch (err) {
    console.error('[Upload] S3 upload failed:', err.message);
    throw err;
  }
};

// ─── uploadOptimized — Sharp compress then S3 ────────────────────────────────
/**
 * Optimise an image with Sharp, then upload to S3.
 * For videos, skips optimisation and uploads directly.
 *
 * @param {Buffer} buffer       — file buffer
 * @param {string} folder       — storage folder / key prefix
 * @param {string} resourceType — 'image' or 'video'
 * @param {Object} transforms   — (ignored, kept for call-site compatibility)
 * @returns {Promise<{ url: string, optimized: boolean }>}
 */
const uploadOptimized = async (buffer, folder, resourceType = 'image', transforms = {}) => {
  let finalBuffer = buffer;
  let optimized   = false;

  if (resourceType === 'image') {
    const origSize  = buffer.length;
    finalBuffer     = await applyImagePreset(buffer, folder);
    optimized       = finalBuffer.length < origSize;
  }

  const url = await uploadToS3(finalBuffer, folder, resourceType);
  return { url, optimized };
};

module.exports = {
  postUpload,
  profileUpload,
  bannerUpload,
  videoUpload,
  uploadToCloudinary,   // now S3-backed
  uploadOptimized,      // now S3-backed
  optimizeImage,        // standalone Sharp helper (unchanged)
};
