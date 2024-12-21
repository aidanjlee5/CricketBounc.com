const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Endpoint to handle email verification
app.post('/send-verification-email', (req, res) => {
  const { email } = req.body;
  console.log(`Received request to send verification email to: ${email}`);

  // Simulate email sending process
  if (email) {
    console.log(`Simulating email sent to: ${email}`);
    res.json({ success: true, message: 'Verification email sent successfully.' });
  } else {
    console.error('Failed to send email: No email provided.');
    res.json({ success: false, message: 'Failed to send email.' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
