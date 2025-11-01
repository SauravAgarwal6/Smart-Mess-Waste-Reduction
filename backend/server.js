// Import required packages
const express = require('express');
const mongoose = require('mongoose'); // <-- NEW: Import mongoose
const cors = require('cors');
require('dotenv').config();

// Initialize the Express app
const app = express();

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json()); 

// =======================================================
// --- NEW CODE START: Database Connection ---
const dbURI = process.env.MONGODB_URI; // Get the URI from the .env file

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));
// --- NEW CODE END ---
// =======================================================

// --- A simple test route ---
app.get('/', (req, res) => {
  res.send('Smart Mess Backend is running!');
});

const authRoutes = require('./routes/auth'); // Import the new auth routes
app.use('/api/auth', authRoutes);

const complaintRoutes = require('./routes/complaints'); // Import complaint routes
app.use('/api/complaints', complaintRoutes); // Use complaint routes

const voteRoutes = require('./routes/votes'); // Import vote routes
app.use('/api/votes', voteRoutes);

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});