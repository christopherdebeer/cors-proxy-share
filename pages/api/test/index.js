

export default function (req, res) {
  require('../cors.js')()
  res.send('Hello from test route!');
};
