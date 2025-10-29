const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import the User model we created

const router = express.Router();

// --- REGISTRATION ROUTE ---
// URL: POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    // 1. Get roll number and password from the request body
    const { rollNo, password } = req.body;

    // 2. Check if a user with this roll number already exists
    const existingUser = await User.findOne({ rollNo });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this roll number already exists." });
    }

    // 3. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create a new user with the hashed password
    const newUser = new User({
      rollNo,
      password: hashedPassword,
    });

    // 5. Save the new user to the database
    await newUser.save();

    // 6. Send a success response
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error during registration.", error });
  }
});

// --- LOGIN ROUTE ---
// URL: POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    // 1. Get roll number and password from request body
    const { rollNo, password } = req.body;

    // 2. Find the user in the database by their roll number
    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 3. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // 4. If passwords match, create a JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        rollNo: user.rollNo, // <-- THE IMPORTANT ADDITION
      },
    };

    // 5. Sign the token with our secret key
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token will be valid for 1 hour
      (err, token) => {
        if (err) throw err;
        // 6. Send the token back to the client
        res.json({ token });
      }
    );
  } catch (error) {
    res.status(500).json({ message: "Server error during login.", error });
  }
});

module.exports = router;
