// Simple script to test Groq API key
const axios = require('axios');
const config = require('./config');

console.log('Testing Groq API connection...');
console.log('API URL:', config.GROQ_API_URL);
console.log('API Key configured:', config.GROQ_API_KEY ? 'Yes (hidden)' : 'No');
console.log('Model:', config.GROQ_MODEL);

async function testGroqAPI() {
  try {
    const response = await axios.post(config.GROQ_API_URL, {
      model: config.GROQ_MODEL,
      messages: [
        { role: 'user', content: 'Hello, this is a test message' }
      ],
      temperature: 0.7,
      max_tokens: 100
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.GROQ_API_KEY}`
      }
    });
    
    console.log('Success! API is working properly.');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error testing Groq API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    return false;
  }
}

testGroqAPI()
  .then(success => {
    if (!success) {
      console.log('\nPossible issues:');
      console.log('1. Invalid API key');
      console.log('2. API key has expired or been revoked');
      console.log('3. API endpoint URL is incorrect');
      console.log('4. Network connectivity issues');
      console.log('5. Model name is incorrect or unavailable');
    }
    process.exit(success ? 0 : 1);
  });