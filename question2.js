const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs provided' });
  }

  const urlRequests = urls.map(url => {
    const requestPromise = axios.get(url)
      .then(response => response.data.numbers)
      .catch(error => {
        console.error(`Error fetching data from ${url}: ${error.message}`);
        return [];
      });

    // Adding a timeout to the request promise
    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => resolve([]), 500); 
    });

    return Promise.race([requestPromise, timeoutPromise]);
  });

  try {
    const responses = await Promise.all(urlRequests);
    const mergedNumbers = responses
      .flatMap(response => response)
      .filter((number, index, self) => self.indexOf(number) === index)
      .sort((a, b) => a - b);

    return res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error(`Error processing requests: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
