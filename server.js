const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');

// We'll use axios instead of fetch for HTTP requests
const axios = require('axios');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGODB_URI = config.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Todo Schema
const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  startTime: {
    type: String,
    default: null
  },
  endTime: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Todo = mongoose.model('Todo', todoSchema);

// Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get todo by ID
app.get('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { title, description, priority, dueDate, startTime, endTime } = req.body;
    
    // Validate required fields
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const todo = new Todo({ 
      title, 
      description, 
      priority, 
      dueDate: dueDate ? new Date(dueDate) : null,
      startTime,
      endTime
    });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// We'll use node-fetch for API requests
const fetch = require('node-fetch');

// AI Assistant endpoint - Generate todo suggestions
app.post('/api/assistant/suggest', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Check if API key is configured
    if (!config.GROQ_API_KEY) {
      // Fallback to local suggestions if no API key
      const suggestions = generateLocalSuggestions(prompt);
      return res.json({ suggestions, source: 'local' });
    }
    
    // Use Groq AI API for suggestions
    try {
      const suggestions = await generateAISuggestions(prompt);
      res.json({ suggestions, source: 'groq' });
    } catch (aiError) {
      console.error('Groq API error:', aiError);
      // Fallback to local suggestions on API error
      const suggestions = generateLocalSuggestions(prompt);
      res.json({ suggestions, source: 'local', note: 'AI service unavailable, using fallback' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate todo suggestions using Groq AI
async function generateAISuggestions(prompt) {
  try {
    // Prepare the prompt for the AI
    const systemPrompt = `You are a helpful AI assistant that generates todo suggestions based on user input. 
    Generate 3-5 practical todo items based on the user's prompt. 
    Each todo should have a title, description, priority (low, medium, or high), dueDate (in YYYY-MM-DD format), startTime (in HH:MM format), and endTime (in HH:MM format).
    If the user mentions a specific date or time (like tomorrow, next week, etc.), use that to set appropriate dueDates.
    If the user mentions specific times, use those for startTime and endTime fields.
    If the user mentions going to the gym in the morning (in any language, including English words like "gym", "morning" or Urdu/Hindi words like "subah", "kal"), automatically set the dueDate to tomorrow morning, priority to high, startTime to "06:00" and endTime to "07:30".
    Respond in JSON format with an array of todo objects, each with title, description, priority, dueDate, startTime, and endTime fields.
    Support multilingual input, especially English, Urdu and Hindi.`;
    
    const userPrompt = `Generate todo suggestions based on: ${prompt}`;
    
    // Log the request details (without API key)
    console.log('Making Groq API request to:', config.GROQ_API_URL);
    console.log('Using model:', config.GROQ_MODEL);
    console.log('API Key configured:', config.GROQ_API_KEY ? 'Yes (hidden)' : 'No');
    
    let completion;
    try {
      // Call Groq API using axios
      const response = await axios.post(config.GROQ_API_URL, {
        model: config.GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.GROQ_API_KEY}`
        }
      });
      
      completion = response.data;
      console.log('Groq API response received successfully');
    } catch (error) {
      console.error('Detailed Groq API error:');
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
        console.error('Error headers:', JSON.stringify(error.response.headers, null, 2));
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      throw error; // Re-throw to be caught by the outer try-catch
    }
    
    // Parse the response
    const responseContent = completion.choices?.[0]?.message?.content || '';
    
    // Extract JSON from the response
    let suggestions = [];
    try {
      // Try to parse the entire response as JSON
      suggestions = JSON.parse(responseContent);
    } catch (e) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = responseContent.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }
    
    // Validate and format suggestions
    return suggestions.map(suggestion => {
      // Process dueDate if provided
      let dueDate = null;
      if (suggestion.dueDate) {
        try {
          // Validate date format
          dueDate = new Date(suggestion.dueDate);
          // Check if date is valid
          if (isNaN(dueDate.getTime())) {
            dueDate = null;
          }
        } catch (e) {
          console.error('Invalid date format:', suggestion.dueDate);
          dueDate = null;
        }
      }
      
      return {
        title: suggestion.title || 'Untitled Todo',
        description: suggestion.description || '',
        priority: ['low', 'medium', 'high'].includes(suggestion.priority) ? suggestion.priority : 'medium',
        dueDate: dueDate
      };
    });
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    throw error;
  }
}

// Fallback function for local todo suggestions
function generateLocalSuggestions(prompt) {
  // Simple keyword matching for demonstration
  const lowercasePrompt = prompt.toLowerCase();
  const suggestions = [];
  
  // Helper function to get tomorrow's date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };
  
  // Special case for gym in the morning (in multiple languages)
  if ((lowercasePrompt.includes('gym') || lowercasePrompt.includes('جم')) && 
      (lowercasePrompt.includes('morning') || lowercasePrompt.includes('subah') || 
       lowercasePrompt.includes('صبح') || lowercasePrompt.includes('سحر') || 
       lowercasePrompt.includes('kal') || lowercasePrompt.includes('کل'))) {
    const tomorrow = getTomorrowDate();
    suggestions.push({
      title: 'Go to gym in the morning',
      description: 'Morning workout session for better health and fitness',
      priority: 'high',
      dueDate: tomorrow,
      startTime: '06:00',
      endTime: '07:30'
    });
  }
  
  if (lowercasePrompt.includes('meeting')) {
    suggestions.push({
      title: 'Schedule team meeting',
      description: 'Discuss project progress and next steps',
      priority: 'high',
      dueDate: getTomorrowDate(),
      startTime: '09:00',
      endTime: '10:30'
    });
  }
  
  if (lowercasePrompt.includes('email') || lowercasePrompt.includes('message')) {
    suggestions.push({
      title: 'Respond to emails',
      description: 'Check inbox and reply to important messages',
      priority: 'medium',
      dueDate: getTomorrowDate(),
      startTime: '08:00',
      endTime: '09:00'
    });
  }
  
  if (lowercasePrompt.includes('report') || lowercasePrompt.includes('document')) {
    suggestions.push({
      title: 'Prepare weekly report',
      description: 'Compile data and create summary for stakeholders',
      priority: 'high',
      dueDate: getTomorrowDate(),
      startTime: '13:00',
      endTime: '15:00'
    });
  }
  
  // Default suggestions if no keywords match
  if (suggestions.length === 0) {
    suggestions.push(
      { title: 'Review project timeline', priority: 'medium', startTime: '10:00', endTime: '11:00' },
      { title: 'Update task list', priority: 'low', startTime: '14:00', endTime: '15:00' },
      { title: 'Plan tomorrow\'s activities', priority: 'medium', startTime: '16:00', endTime: '17:00' }
    );
  }
  
  return suggestions;
}

// Update todo
app.put('/api/todos/:id', async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate, startTime, endTime } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        description, 
        completed, 
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        startTime,
        endTime
      },
      { new: true, runValidators: true }
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle todo completion status
app.patch('/api/todos/:id/toggle', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json({ message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve index.html for root and fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});
