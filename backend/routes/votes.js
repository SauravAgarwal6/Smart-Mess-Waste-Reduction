const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const VoteLedger = require('../models/VoteLedger');

// --- Helper Function: Get Today's Date String ---
// This gets the date in 'YYYY-MM-DD' format for India (Asia/Kolkata)
// This is the key to the automatic 12:00 AM reset.
function getTodayDateString() {
  // Creates a date object for the current time in India
  const todayInIndia = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  // Formats it as YYYY-MM-DD
  return todayInIndia.toLocaleDateString('en-CA');
}

// --- Helper Function: Get or Create Today's Vote Ledger ---
async function getTodaysLedger() {
  const todayDateString = getTodayDateString();

  let ledger = await VoteLedger.findOne({ dateString: todayDateString });

  if (!ledger) {
    // No ledger found for today, so create a new one.
    // This is the "auto-reset" in action.
    ledger = new VoteLedger({ dateString: todayDateString });
    await ledger.save();
  }
  return ledger;
}

// --- Route 1: GET /api/votes ---
// Gets the current vote counts for the day
// Protected: Only logged-in users can see the votes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const ledger = await getTodaysLedger();

    // We also check what the currently logged-in user has voted for
    const userId = req.user.id;

    res.json({
      counts: {
        breakfast: ledger.breakfast.length,
        lunch: ledger.lunch.length,
        dinner: ledger.dinner.length
      },
      userVotes: {
        breakfast: ledger.breakfast.includes(userId),
        lunch: ledger.lunch.includes(userId),
        dinner: ledger.dinner.includes(userId)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching votes.' });
  }
});

// --- Route 2: POST /api/votes ---
// Submits a vote for a specific meal
// Protected: Only logged-in users can vote
router.post('/', authMiddleware, async (req, res) => {
  const { meal } = req.body; // e.g., "breakfast", "lunch", "dinner"
  const userId = req.user.id;

  // Validate the meal name
  if (!['breakfast', 'lunch', 'dinner'].includes(meal)) {
    return res.status(400).json({ message: 'Invalid meal type.' });
  }

  try {
    const ledger = await getTodaysLedger();

    // Check if user has already voted for this meal
    if (ledger[meal].includes(userId)) {
      return res.status(400).json({ message: `You have already voted for ${meal}.` });
    }

    // Add the user's ID to the vote list
    ledger[meal].push(userId);
    await ledger.save();

    // Return the updated counts (same as the GET route)
    const updatedLedger = await VoteLedger.findById(ledger._id);
    res.status(201).json({
      counts: {
        breakfast: updatedLedger.breakfast.length,
        lunch: updatedLedger.lunch.length,
        dinner: updatedLedger.dinner.length
      },
      userVotes: {
        breakfast: updatedLedger.breakfast.includes(userId),
        lunch: updatedLedger.lunch.includes(userId),
        dinner: updatedLedger.dinner.includes(userId)
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error submitting vote.' });
  }
});

// --- Route 3: DELETE /api/votes/reset ---
// Resets all vote counts for the day
// Protected: ADMIN ONLY
router.delete('/reset', authMiddleware, async (req, res) => {
  // 1. Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const ledger = await getTodaysLedger();

    // 2. Reset the vote arrays
    ledger.breakfast = [];
    ledger.lunch = [];
    ledger.dinner = [];
    await ledger.save();

    res.json({
      message: 'Votes for today have been reset successfully.',
      counts: { breakfast: 0, lunch: 0, dinner: 0 }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error resetting votes.' });
  }
});

module.exports = router;