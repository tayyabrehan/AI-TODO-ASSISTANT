require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Prefer full URI if provided
let mongoUri = process.env.MONGODB_URI;

// If no full URI, try to construct from parts (recommended)
if (!mongoUri) {
  const username = process.env.MONGODB_USERNAME;
  const password = process.env.MONGODB_PASSWORD;
  const host = process.env.MONGODB_HOST; // e.g. cluster0.znmqnw5.mongodb.net
  const dbName = process.env.MONGODB_DBNAME || 'user-app';

  if (username && password && host) {
    mongoUri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
  } else {
    // Fallback to local MongoDB for development
    mongoUri = `mongodb://127.0.0.1:27017/${dbName}`;
  }
}

// Groq AI API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

module.exports = {
  PORT: PORT,
  MONGODB_URI: mongoUri,
  GROQ_API_KEY: GROQ_API_KEY,
  GROQ_API_URL: GROQ_API_URL,
  GROQ_MODEL: GROQ_MODEL
};
