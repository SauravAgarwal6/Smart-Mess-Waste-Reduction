// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // CORS is still imported
require('dotenv').config();

// Initialize the Express app
const app = express();

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

// --- Middleware ---

const allowedOrigins = [
  'http://127.0.0.1:5500', // Your local frontend (from the screenshot)
  'http://localhost:5500'  // Just in case
  // We will add your LIVE frontend URL here later
];

app.use(cors({
  origin: function (origin, callback) {
    // Check if the incoming address is in our whitelist
    // The `!origin` part allows requests from Postman/Insomnia (no origin)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // If it is, allow it
      callback(null, true);
    } else {
      // If it's not, block it
      callback(new Error('This address is not allowed by CORS'));
    }
  }
}));
// --- NEW CORS CONFIGURATION END ---
// =======================================================

app.use(express.json()); // This was already here and is correct

// --- Database Connection ---
const dbURI = process.env.MONGODB_URI; // Get the URI from the .env file

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- A simple test route ---
app.get('/', (req, res) => {
  res.send('Smart Mess Backend is running!');
});

// --- API Routes ---
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