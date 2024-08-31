const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const secret = process.env.SECRET; // Get the secret from environment variables

app.use(bodyParser.json());

app.get('/test', (req,res) => {
  res.status(200).json({status: "ok"})
})
app.get('/api/test', (req,res) => {
  res.status(200).json({status: "ok"})
})

app.post('/api/update', (req, res) => {
  const { route, jsFile } = req.body;
  const secretKey = req.headers.secret; // Get the secret key from the request header

  if (!secretKey || secretKey !== secret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!route || !jsFile) {
    return res.status(400).json({ error: 'Missing route or jsFile' });
  }

  try {
    const filePath = path.join(__dirname, 'routes', `${route}.js`);
    fs.writeFileSync(filePath, jsFile);
    console.log(`File written to ${filePath}`);
    res.json({ message: 'File updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update file' });
  }
});

// Function to dynamically load and execute route handlers
function loadRoutes(req, res, next) {
  console.log(`loading route for ${req.path}`)
  const routePath = path.join(__dirname, 'routes', `${req.path}.js`);

  try {
    // Check if the route file exists
    if (fs.existsSync(routePath)) {
      const routeHandler = require(routePath);
      // Call the route handler
      if (routeHandler && typeof routeHandler === 'function') {
        routeHandler(req, res, next); // Pass next for potential middleware usage
      } else {
        res.status(404).json({ error: 'Route handler not found' });
      }
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error loading route handler' });
  }
}

// Apply CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next(); // Move to the next middleware or route handler
});

// Dynamically load routes
app.use('*', loadRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;

async function CORShandler(req, res) {
  const { method, headers, body } = req;
  const url = headers['my-url'];

  // Handle preflight OPTIONS requests
  if (method === 'OPTIONS') {
    console.log("Received OPTIONS request");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,my-url');
    return res.status(204).end();
  }

  if (!url) {
    console.log("Missing URL in headers", { method, headers, body });
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(400).json({ type: 'error', message: 'Missing URL in headers' });
  }

  console.log("Making request", { method, headers, body, url });

  const axiosConfig = {
    method: method.toLowerCase(),
    url,
    headers: { ...headers, host: new URL(url).host },
    data: body,
    responseType: 'stream',
  };

  try {
    const response = await axios(axiosConfig);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', response.headers['content-length'] || '');

    response.data.pipe(res);
  } catch (error) {
    console.error("Error in proxy request", { error, axiosConfig });
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ type: 'error', message: error.message });
  }
}
