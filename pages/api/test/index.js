const cors = require('../cors.js');

module.exports = function (req, res) {
  cors(req,res);
  res.send('Hello from test route!');
};
