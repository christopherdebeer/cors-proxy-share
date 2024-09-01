const cors = require('../cors');

module.exports = (req, res) => {
  if (cors(req, res)) return;
  res.send('Hello from test route!');
};
