const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs').promises;

const corsUtility = `
const cors = require("${path.join(__dirname,'/cors')}");

module.exports = (req, res) => {
  if (cors(req, res)) return;

`;
const secret = process.env.SECRET; // Get the secret from environment variables

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', async () => {
      const { path, code } = JSON.parse(body);
      await fs.mkdir(`./${path}`, { recursive: true });
      const fullCode = corsUtility + code + '\n};';
      await fs.writeFile(`./${path}/index.js`, fullCode);
      res.end('File written successfully');
    });
  } else if (req.method === 'GET') {
    res.end('POST: {"path": "route", "code": "function body"} to write file. GET: Show this message.');
  }
}
