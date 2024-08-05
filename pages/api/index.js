const axios = require('axios');

export default async function handler(req, res) {
  const { method, headers, body } = req;
  const url = headers['my-url'];

  if (!url) {
    return res.status(400).json({ type: 'error', message: 'Missing URL in headers' });
  }

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
    console.error(error.message);
    res.status(500).json({ type: 'error', message: error.message });
  }
}
