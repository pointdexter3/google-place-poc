const express = require('express');
const cors = require('cors');
// Using built-in fetch (Node 18+)

const app = express();
const PORT = 3000;

// Enable CORS for your Angular app
app.use(cors({
  origin: 'http://localhost:4200'
}));

app.use(express.json());

// GOOGLE_PLACES_API_KEY import from api-key.consts.js
const { GOOGLE_PLACES_API_KEY } = require('./src/app/api-key.consts.js');
const GOOGLE_API_KEY = GOOGLE_PLACES_API_KEY; // Your API key

// Autocomplete proxy endpoint using NEW Places API
app.post('/api/places/autocomplete', async (req, res) => {
  console.log('=== AUTOCOMPLETE ENDPOINT HIT ===');
  console.log('Request body:', req.body);
  try {
    const { input } = req.body;
    console.log('Autocomplete request for:', input);

    const url = 'https://places.googleapis.com/v1/places:autocomplete';

    const requestBody = {
      input: input,
      includedPrimaryTypes: ['street_address', 'establishment'],
      languageCode: 'en'
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text',
        'Referer': 'http://localhost:4200'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));

    // Transform new API response to match old API structure
    const transformedData = {
      predictions: data.suggestions?.map(suggestion => ({
        description: suggestion.placePrediction.text.text,
        place_id: suggestion.placePrediction.placeId,
        structured_formatting: {
          main_text: suggestion.placePrediction.text.text.split(',')[0] || '',
          secondary_text: suggestion.placePrediction.text.text.split(',').slice(1).join(',').trim() || ''
        },
        types: ['address'],
        terms: [],
        matched_substrings: []
      })) || [],
      status: data.suggestions ? 'OK' : 'ZERO_RESULTS'
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});// Place details proxy endpoint
app.post('/api/places/details', async (req, res) => {
  try {
    const { place_id } = req.body;

    if (!place_id) {
      return res.status(400).json({ error: 'place_id is required' });
    }

    const url = 'https://places.googleapis.com/v1/places/' + place_id;

    const requestBody = {
      fieldMask: 'id,displayName,formattedAddress,location,types,addressComponents'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,types,addressComponents',
        'Referer': 'http://localhost:4200'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    // Transform the response to match the legacy format
    const transformedData = {
      result: {
        place_id: data.id,
        formatted_address: data.formattedAddress,
        name: data.displayName?.text || '',
        geometry: {
          location: {
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0
          }
        },
        types: data.types || [],
        address_components: data.addressComponents?.map(component => ({
          long_name: component.longText,
          short_name: component.shortText,
          types: component.types
        })) || []
      },
      status: data.id ? 'OK' : 'NOT_FOUND'
    };

    res.json(transformedData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});
