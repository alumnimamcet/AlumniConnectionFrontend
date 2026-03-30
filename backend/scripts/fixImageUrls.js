/**
 * One-time migration script to patch existing MongoDB documents
 * that contain `http://localhost:5000` image URLs.
 *
 * USAGE (run ONCE after deploying the backend):
 *   node scripts/fixImageUrls.js
 *   — or —
 *   npm run fix-urls
 *   npm run fix-image-urls
 *
 * PREREQUISITE: Set BACKEND_URL in your .env to the deployed backend URL:
 *   BACKEND_URL=https://your-actual-deployed-backend.railway.app
 */
require('dotenv').config();
const mongoose = require('mongoose');

async function fixUrls() {
  const OLD = 'http://localhost:5000';
  const NEW = process.env.BACKEND_URL;

  if (!NEW || NEW.includes('localhost')) {
    console.error('Set BACKEND_URL to your deployed URL in .env first');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  const collections = [
    { name: 'users',  fields: ['profilePic', 'bannerPic'] },
    { name: 'posts',  fields: ['media'] },
  ];

  for (const { name, fields } of collections) {
    for (const field of fields) {
      const filter = { [field]: { $regex: 'localhost:5000' } };
      const update = [{ $set: { [field]: { $replaceAll: {
        input: `$${field}`, find: OLD, replacement: NEW
      }}}}];
      const result = await db.collection(name).updateMany(filter, update);
      console.log(`${name}.${field}: fixed ${result.modifiedCount} records`);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete');
}

fixUrls().catch(console.error);
