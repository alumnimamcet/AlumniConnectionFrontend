/**
 * config/s3.js — AWS S3 client configuration.
 *
 * Reads credentials from environment variables.
 * Required env vars:
 *   AWS_ACCESS_KEY  — IAM access key ID
 *   AWS_SECRET_KEY  — IAM secret access key
 *   AWS_REGION      — e.g. ap-south-1
 */
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId:     process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region:          process.env.AWS_REGION,
});

module.exports = s3;
