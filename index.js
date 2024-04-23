require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Define an object to store URL mappings
const urlMap = {};

// Define route to handle POST requests to shorten URLs

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Validate the submitted URL format
  const urlPattern = /^(https?):\/\/www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/;
  if (!urlPattern.test(originalUrl)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  // Validate the submitted URL by performing a DNS lookup
  dns.lookup(new URL(originalUrl).hostname, (err) => {
    if (err) {
      return res.status(400).json({ error: 'invalid url' });
    }

    // Generate a short code for the URL
    const shortCode = generateShortCode();

    // Store the mapping between short code and original URL
    urlMap[shortCode] = originalUrl;

    // Respond with the short code
    res.json({ original_url: originalUrl, short_url: shortCode });
  });
});

// Define route to handle GET requests to redirect to original URLs
app.get('/api/shorturl/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;

  // Check if the short code exists in the mapping
  if (urlMap.hasOwnProperty(shortCode)) {
    // Redirect to the original URL associated with the short code
    res.redirect(urlMap[shortCode]);
  } else {
    // Respond with an error if the short code is not found
    res.status(404).json({ error: 'Short URL not found' });
  }
});

// Helper function to generate a random short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}