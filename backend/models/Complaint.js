const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ComplaintSchema = new Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  // We store the roll number for easy display
  authorRoll: {
    type: String,
    required: true
  },
  // We link to the User's unique ID for database integrity
  authorId: {
    type: Schema.Types.ObjectId,
    ref: 'User', // This creates a direct reference to a document in the 'User' collection
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now // Automatically sets the creation date and time
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);