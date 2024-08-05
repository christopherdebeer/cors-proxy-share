const axios = require('axios');

export default async function handler(req, res) {
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
