const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3001;

app.get('/trains', async (req, res) => {
  try {
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2OTIxOTU3NjksImNvbXBhbnlOYW1lIjoiVHJhaW4gQ2VudHJhbCIsImNsaWVudElEIjoiMWI0OWJlYzEtMTY2My00YjUyLTg1NjQtODhhNDEyNmJhYzRmIiwib3duZXJOYW1lIjoiIiwib3duZXJFbWFpbCI6IiIsInJvbGxObyI6IjgwOSJ9.ZVw4VJIaqfukYYc3-921-gJHzmJ_5XZgOyhdw85J9hM'; // Replace with your actual bearer token

    const headers = {
      Authorization: `Bearer ${accessToken}`
    };

    const response = await axios.get('http://20.244.56.144/train/trains', { headers });
    const trainDetails = response.data;

    console.log('Received response from API:', trainDetails); // Log the API response

    if (!Array.isArray(trainDetails)) {
      return res.status(500).json({ error: 'Invalid API response format' });
    }

    const now = new Date();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    const filteredAndSortedTrains = trainDetails
      .filter(train => {
        const departureTime = new Date();
        departureTime.setHours(train.departureTime.Hours, train.departureTime.Minutes, train.departureTime.Seconds, 0);
        return departureTime - now > THIRTY_MINUTES;
      })
      .sort((a, b) => {
        const priceComparison = a.price.sleeper - b.price.sleeper;
        if (priceComparison !== 0) {
          return priceComparison;
        }

        const seatsComparison = b.seatsAvailable.sleeper - a.seatsAvailable.sleeper;
        if (seatsComparison !== 0) {
          return seatsComparison;
        }

        const departureTimeA = new Date();
        departureTimeA.setHours(a.departureTime.Hours, a.departureTime.Minutes, a.departureTime.Seconds, 0);

        const departureTimeB = new Date();
        departureTimeB.setHours(b.departureTime.Hours, b.departureTime.Minutes, b.departureTime.Seconds, 0);

        return departureTimeB - departureTimeA;
      });

    return res.json(filteredAndSortedTrains);
  } catch (error) {
    console.error(`Error fetching train data: ${error.message}`);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
