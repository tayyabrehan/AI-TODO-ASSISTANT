# Todo AI Assistant - Node.js + MongoDB Web App

A modern todo application with a static HTML/CSS/JS frontend and Node.js backend connected to MongoDB. This app provides a smart todo management system with AI-powered task suggestions using Groq AI.

## Features

- **Frontend**: Static HTML, CSS and vanilla JS served by Express
- **Backend**: Node.js with Express.js
- **Database**: MongoDB for data storage
- **API**: RESTful API endpoints for all operations
- **CRUD Operations**: Create, Read, Update, Delete todos
- **AI Assistant**: Generate todo suggestions using Groq AI
- **Priority Levels**: Low, Medium, High priority settings for tasks
- **Due Dates & Times**: Schedule tasks with due dates, start and end times
- **Filtering**: Filter todos by All, Active, or Completed status
- **Responsive**: Clean and modern interface

## Project Structure

```
├── public/             # Static frontend (HTML/CSS/JS)
│   ├── index.html      # Main HTML file
│   ├── styles.css      # CSS styles
│   └── app.js          # Frontend JavaScript
├── server.js           # Node.js backend server
├── config.js           # Configuration file
├── .env                # Environment variables (not tracked in git)
├── .gitignore          # Git ignore file
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Prerequisites

Before running this application, make sure you have the following installed:

1. **Node.js** (version 14 or higher)
2. **MongoDB** (local installation or MongoDB Atlas account)
3. **Groq API Key** (optional, for AI assistant functionality)

## Installation

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

> Note: If you don't have a Groq API key, the application will fall back to local suggestions.

## Running the Application

1. Start the server:

```bash
npm start
```

2. For development with auto-restart:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5000`

## Usage

### Todo Management

- **Create Todo**: Fill out the form and click "Add Todo"
- **Edit Todo**: Click the edit icon on any todo item
- **Delete Todo**: Click the delete icon on any todo item
- **Mark as Complete**: Click the checkbox on any todo item
- **Filter Todos**: Use the filter buttons to view All, Active, or Completed todos

### AI Assistant

1. Type a request in the AI Assistant input field (e.g., "Create a shopping list for dinner")
2. Click "Ask Assistant"
3. The AI will generate todo suggestions
4. Click "Add" on any suggestion to add it to your todo list


## API Documentation

### Todo Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a specific todo by ID
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### AI Assistant Endpoints

- `POST /api/assistant/suggest` - Generate todo suggestions based on a prompt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in your `.env` file
   - Verify MongoDB is accessible on the specified port

2. **Port Already in Use**
   - Change the port in your `.env` file
   - Kill any process using port 5000

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check that all required packages are installed

4. **Groq API Issues**
   - Verify your Groq API key is correct in the `.env` file
   - Check that the selected model is available in your Groq account

### Frontend Issues

1. **Cannot Connect to Backend**
   - Ensure the Node.js server is running
   - Verify the backend is accessible at `http://localhost:5000`

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **AI Integration**: Groq API

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the project repository.
