# HTML/CSS Frontend + Node.js + MongoDB Web App

A simple web application with a static HTML/CSS/JS frontend and Node.js backend connected to MongoDB. This app provides a user management system with full CRUD operations.

## Features

- **Frontend**: Static HTML, CSS and vanilla JS served by Express
- **Backend**: Node.js with Express.js
- **Database**: MongoDB for data storage
- **API**: RESTful API endpoints for all operations
- **CRUD Operations**: Create, Read, Update, Delete users
- **Dashboard**: Overview with metrics and recent users
- **Search**: Search functionality for users
- **Responsive**: Clean and modern interface

## Project Structure

```
├── public/             # Static frontend (HTML/CSS/JS)
├── server.js           # Node.js backend server
├── config.js           # Configuration file
├── package.json        # Node.js dependencies
└── README.md           # This file
```

## Prerequisites

Before running this application, make sure you have the following installed:

1. **Node.js** (version 14 or higher)
3. **MongoDB** (local installation or MongoDB Atlas)

## Installation & Setup

### 1. Clone or Download the Project

Make sure all files are in the same directory.

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Set up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   ```bash
   mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in `config.js` with your Atlas connection string (or set environment variables)

### 4. Configure the Application

The application uses the following default configuration:
- **Backend Port**: 5000
- **MongoDB URI**: mongodb://localhost:27017/user-app

To change these settings, modify the `config.js` file or set environment variables.

## Running the Application

### 1. Start the Backend Server

Open a terminal/command prompt and run:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

You should see:
```
Server is running on port 5000
Connected to MongoDB
API endpoints available at http://localhost:5000/api
```

### 2. Open the Frontend

Open your browser and go to `http://localhost:5000`.

## API Endpoints

The backend provides the following REST API endpoints:

- `GET /api/health` - Health check
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Usage

### Add User
- Fill in user details (name, email, age)
- Submit to create a new user
- Validation ensures all fields are filled

### View Users
- See all users in a table

### Update User
- Click Edit, modify fields and save

### Delete User
- Click Delete on a user row and confirm

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the connection string in `config.js`
   - Verify MongoDB is accessible on the specified port

2. **Port Already in Use**
   - Change the port in `config.js`
   - Kill any process using port 5000

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check that all required packages are installed

### Frontend Issues

1. **Cannot Connect to Backend**
   - Ensure the Node.js server is running
   - Verify the backend is accessible at `http://localhost:5000`

## Development

### Adding New Features

1. **Backend**: Add new routes in `server.js`
2. **Frontend**: Update `public/` files
3. **Database**: Modify the schema in `server.js` if needed

### Environment Variables

You can use environment variables to configure the application:

```bash
export PORT=5000
export MONGODB_URI=mongodb://localhost:27017/user-app
```

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose

## License

MIT License - feel free to use this project for learning and development purposes.

## Support

If you encounter any issues or have questions, please check the troubleshooting section above or create an issue in the project repository.
