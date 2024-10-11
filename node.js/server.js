const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Body parser to handle JSON requests
app.use(bodyParser.json());

// Infobip API details
const infobipConfig = {
  url: 'https://lq3drr.api.infobip.com//sms/2/text/advanced', // Correct Infobip API URL
  headers: {
    'Authorization': 'App 590cec2efbdf7475ead7fc59cb28864f-689f957e-f691-40ec-8b86-bf51ecc34cfb', // Infobip API Key
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// SMS sending endpoint
app.post('/send-sms', async (req, res) => {
  const { to, message } = req.body;

  // Check if both "to" and "message" are provided
  if (!to || !message) {
    return res.status(400).json({ error: 'Missing "to" or "message" in request body.' });
  }

  const postData = {
    "messages": [
      {
        "destinations": [{ "to": to }],  // Recipient phone number
        "from": "447491163443", // Sender ID or approved phone number from Infobip
        "text": message
      }
    ]
  };

  try {
    // Sending the SMS request to Infobip
    const response = await axios.post(infobipConfig.url, postData, {
      headers: infobipConfig.headers
    });

    // Respond with Infobip API's response
    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    // Handle any errors
    console.error('Error sending SMS:', error.response ? error.response.data : error.message);
    return res.status(500).json({
      error: 'Failed to send SMS.',
      details: error.response ? error.response.data : error.message
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
