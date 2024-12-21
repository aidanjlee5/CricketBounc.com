const express = require('express');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors'); // Import CORS middleware
const app = express();
app.use(express.json());
require('dotenv').config();

// MongoDB connection URI
const uri = 'mongodb+srv://ishanj1604:whatismypassword1604@cluster0.9apsw.mongodb.net/bounc_db?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let db;

// CORS configuration
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // For legacy browser support
  };
  
app.use(cors(corsOptions)); // Use CORS with the specified options
  

// Initialize MongoDB connection and start the server
(async () => {
    try {
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        db = client.db('bounc_db');
        console.log('Connected to MongoDB');
        
        // Start server after MongoDB connection is established
        app.listen(3001, () => {
            console.log('Server is running on port 3001');
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
})();

app.get('/health', async (req, res) => {
    try {
      await client.db().admin().ping();
      res.status(200).send('MongoDB is connected and running!');
    } catch (err) {
      res.status(500).send('MongoDB connection failed.');
    }
  });
  

function migrateUserData() {
    const usersFile = './users.json';
    fs.readFile(usersFile, 'utf8', async (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return;
        }
        const users = JSON.parse(data);
        try {
            await db.collection('users').insertMany(users, { ordered: false });
            console.log('Users migrated successfully');
        } catch (error) {
            if (error.code === 11000) {
                console.log('Duplicate entries were found and skipped.');
            } else {
                console.error('Error inserting users:', error);
            }
        }
    });
}

// Email transporter setup for sending verification emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Route to check if a user exists
app.post('/check-user', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });
        if (user) {
            return res.status(200).json({ exists: true });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking if user exists:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route for sending verification email
app.post('/send-verification-email', async (req, res) => {
    const { email } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6 digit code

    try {
        await db.collection('verificationCodes').insertOne({ email, code: verificationCode });

        // Send email with the verification code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending verification email:', error);
                return res.status(500).send({ success: false, message: 'Failed to send verification email' });
            }
            res.send({ success: true, code: verificationCode });
        });

    } catch (err) {
        console.error('Error sending verification email:', err);
        res.status(500).send({ success: false, message: 'Error sending verification email' });
    }
});

// Route for verifying the code
app.post('/verify-code', async (req, res) => {
    const { email, code } = req.body;

    try {
        const record = await db.collection('verificationCodes').findOne({ email, code: parseInt(code) });

        if (!record) {
            return res.status(400).send({ success: false, message: 'Verification code is incorrect' });
        }

        res.send({ success: true, message: 'Verification successful' });
    } catch (err) {
        console.error('Error verifying code:', err);
        res.status(500).send({ success: false, message: 'Error verifying code' });
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        if (user.password !== password) {
            return res.status(401).send({ success: false, message: 'Incorrect password' });
        }
        res.send({ success: true, message: 'Login successful' });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send({ success: false, message: 'An error occurred during login' });
    }
});

// Route to handle user signup and save additional user info
app.post('/signup', async (req, res) => {
    const { email, password, firstName, lastName, cricketExperience, isUNCStudent, year, joinBCL, randomTeam } = req.body;
    try {
        const existingUser = await db.collection('users').findOne({ email });
        if (existingUser) {
            return res.status(400).send({ success: false, message: 'User already exists' });
        }

        const newUser = {
            email,
            password,
            firstName,
            lastName,
            cricketExperience,
            isUNCStudent,
            year,
            joinBCL,
            randomTeam,
            runs: 0,
            wickets: 0,
            games: 0,
            sixes: 0,
        };

        await db.collection('users').insertOne(newUser);
        res.send({ success: true, message: 'User signed up successfully' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send({ success: false, message: 'An error occurred during signup' });
    }
});

// Route for password reset request
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await db.collection('users').findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }

        // Generate a verification code and send it to the user's email
        const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6 digit code

        await db.collection('verificationCodes').insertOne({ email, code: verificationCode });

        // Send email with the verification code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Verification Code',
            text: `Your password reset verification code is: ${verificationCode}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
                return res.status(500).send({ success: false, message: 'Failed to send reset verification email' });
            }
            res.send({ success: true, message: 'Verification code sent. Please check your email.' });
        });

    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).send({ success: false, message: 'Error during password reset' });
    }
});

// Route for saving new password after verification
app.post('/save-user-data', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.collection('users').updateOne(
            { email },
            { $set: { password } }
        );
        if (result.matchedCount === 0) {
            return res.status(404).send({ success: false, message: 'User not found' });
        }
        res.send({ success: true, message: 'Password updated successfully. You can now log in with your new password.' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).send({ success: false, message: 'Failed to update user password.' });
    }
});

// Additional utility route for saving other user-related data to file
app.post('/save-user-to-file', async (req, res) => {
    const { firstName, lastName, team } = req.body;

    const userData = `First Name: ${firstName}\nLast Name: ${lastName}\nTeam: ${team}\n\n`;
    const filePath = './user_data.txt';

    fs.appendFile(filePath, userData, (err) => {
        if (err) {
            console.error('Error saving user data to file:', err);
            return res.status(500).send({ success: false, message: 'Failed to save user data to file' });
        }
        res.send({ success: true, message: 'User data saved to file successfully' });
    });
});


module.exports = app;
