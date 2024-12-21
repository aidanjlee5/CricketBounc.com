const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(bodyParser.json());

app.post('/save-user-data', (req, res) => {
    const { email, password, cricketExperience, isUNCStudent, year } = req.body;

    const userData = {
        email,
        password,
        cricketExperience,
        isUNCStudent,
        year,
    };

    // Specify the path to save the user data
    const filePath = path.join(__dirname, 'userData.json');

    // Read the existing data if any
    let data = [];
    if (fs.existsSync(filePath)) {
        const existingData = fs.readFileSync(filePath);
        data = JSON.parse(existingData);
    }

    // Add the new user data
    data.push(userData);

    // Write the updated data back to the file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    res.status(200).json({ success: true, message: 'User data saved successfully!' });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});

app.post('/send-verification-email', (req, res) => {
  const { email } = req.body;
  const code = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit code

  // Save the code to the user's session or database
  req.session.verificationCode = code; // Example: save in session

  // Simulate sending the email
  console.log(`Sending verification code ${code} to ${email}`);

  res.status(200).json({ success: true, code });
});

app.post('/verify-code', (req, res) => {
  const { email, verificationCode } = req.body;

  // Verify the code
  if (req.session.verificationCode === verificationCode) {
    res.status(200).json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Verification code is incorrect.' });
  }
});
