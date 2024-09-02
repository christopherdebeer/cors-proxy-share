const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs').promises;
const cors = require('./cors');
const corsUtility = `
const cors = require("${path.join(__dirname,'/cors')}");

module.exports = (req, res) => {
  if (cors(req, res)) return;

`;
const secret = process.env.SECRET; // Get the secret from environment variables

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (req.method === 'POST') {
    let body = req.body;
    console.log("payload received: ", body)
    const { path, code } = req.body;
    await fs.mkdir(`./${path}`, { recursive: true });
    const fullCode = corsUtility + code + '\n};';
    await fs.writeFile(`./${path}/index.js`, fullCode);
    console.log('File written successfully');
    res.status(200);
    res.end(JSON.stringify({status: "ok"}))
  } else if (req.method === 'GET') {
    res.status(200);
    res.end('POST: {"path": "route", "code": "function body"} to write file. GET: Show this message.');
  }
}
