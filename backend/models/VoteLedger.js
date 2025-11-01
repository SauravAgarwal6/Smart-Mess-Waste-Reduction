const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/*
 * This model holds a SINGLE document for EACH day.
 * It stores arrays of User IDs to ensure one vote per user, per meal.
 */
const VoteLedgerSchema = new Schema({
  // The date for this ledger, e.g., "2025-11-01"
  dateString: {
    type: String,
    required: true,
    unique: true, // Only one ledger per day
    index: true
  },
  breakfast: {
    type: [Schema.Types.ObjectId], // Array of User IDs who voted
    ref: 'User',
    default: []
  },
  lunch: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  dinner: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  }
});

module.exports = mongoose.model('VoteLedger', VoteLedgerSchema);