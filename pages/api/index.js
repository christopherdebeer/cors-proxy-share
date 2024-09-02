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
    try {
       const fnc = new Function("req","res", corsUtility + code + "\n}")
       return fnc(req,res);
    } catch(error) {
      res.status(400)
      res.end(JSON.stringify({error, message: error.message}))
    }
  } else if (req.method === 'GET') {
    res.status(200);
    res.end('POST: {"path": "route", "code": "function body"} to write file. GET: Show this message.');
  }
}
