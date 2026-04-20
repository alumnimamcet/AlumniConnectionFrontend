/**
 * utils/s3Cleanup.js — fire-and-forget S3 object deletion.
 *
 * Extracts the S3 object key from a stored URL and deletes it from the bucket.
 * Handles both path-style and virtual-hosted-style S3 URLs.
 *
 * Failures are silently logged — post/profile deletion should never
 * fail because of a storage cleanup issue.
 *
 * URL formats handled:
 *   https://<bucket>.s3.<region>.amazonaws.com/<key>
 *   https://<bucket>.s3.amazonaws.com/<key>
 *   https://s3.<region>.amazonaws.com/<bucket>/<key>  (path-style)
 */
const s3 = require('../config/s3');

/**
 * Extract the S3 object key from a stored URL.
 * @param {string} url — full S3 HTTPS URL
 * @returns {string|null} — key path or null if not an S3 URL
 */
const extractS3Key = (url) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);

    // Virtual-hosted style: https://<bucket>.s3[.<region>].amazonaws.com/<key>
    if (parsed.hostname.includes('.amazonaws.com')) {
      // pathname starts with '/', strip it
      return parsed.pathname.replace(/^\//, '') || null;
    }
    return null;
  } catch {
    return null;
  }
};

/**
 * Delete an S3 object by its stored URL.  Fire-and-forget.
 * Silently skips non-S3 URLs (e.g. old Cloudinary URLs in DB — leave them as-is).
 * @param {string} url — full S3 URL stored in the database
 */
const deleteFromS3 = async (url) => {
  if (!url || !url.includes('amazonaws.com')) return; // skip Cloudinary or empty
  const key = extractS3Key(url);
  if (!key) {
    console.warn('[S3 Cleanup] Could not extract key from URL:', url);
    return;
  }
  try {
    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET,
      Key: key,
    }).promise();
  } catch (err) {
    console.warn(`[S3 Cleanup] Failed to delete "${key}":`, err.message);
  }
};

module.exports = { deleteFromS3, extractS3Key };
