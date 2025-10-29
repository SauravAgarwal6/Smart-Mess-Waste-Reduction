const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  rollNo: {
    type: String,
    required: true,
    unique: true, // Ensures no two users can have the same roll number
    trim: true,   // Removes any whitespace from the beginning and end
    uppercase: true // Stores the roll number in uppercase
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'admin'], // The role must be one of these two values
    default: 'student'         // New users are students by default
  }
});

// Create and export the model
module.exports = mongoose.model('User', UserSchema);