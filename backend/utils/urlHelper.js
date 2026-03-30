/**
 * Unified URL helper for all file upload routes.
 * Always uses BACKEND_URL env var so deployed URLs are never localhost.
 * Set BACKEND_URL=https://your-backend.railway.app in your deployment dashboard.
 */

/**
 * Builds a full absolute URL for an uploaded file.
 * If path is already absolute (starts with http), returns as-is.
 */
const getFileUrl = (relativePath) => {
  if (!relativePath) return '';
  const base = process.env.BACKEND_URL || 'http://localhost:5000';
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  return `${base}${relativePath}`;
};

/**
 * Builds the relative upload path for a given category and filename.
 */
const getUploadPath = (category, filename) => {
  const paths = {
    profile: `/uploads/profiles/${filename}`,
    banner:  `/uploads/banners/${filename}`,
    post:    `/uploads/posts/${filename}`,
    video:   `/uploads/videos/${filename}`,
  };
  return paths[category] || `/uploads/${filename}`;
};

module.exports = { getFileUrl, getUploadPath };
