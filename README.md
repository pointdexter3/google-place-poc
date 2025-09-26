# BMO Places Autocomplete POC

A proof-of-concept Angular 19 application demonstrating address autocomplete functionality using Google Places API for BMO.


## OTHER BANKS
- **TD** https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service (DEPRECATED)
- **TANGERINE** https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service (DEPRECATED)

## Features

- **Real-time Address Search**: Type-ahead search with debounced input (300ms delay)
- **Interactive Predictions**: Click on address suggestions to get detailed information
- **Comprehensive Address Details**: Shows formatted address, coordinates, place types, and address components
- **Responsive Design**: Optimized for desktop and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Error Handling**: Graceful error handling for API failures
- **Loading States**: Visual feedback during API calls

## Project Structure

```
src/app/
├── app.component.ts          # Main component with autocomplete logic
├── app.component.html        # Template with search input and results display
├── app.component.css         # Styled components with BMO-inspired colors
├── places.service.ts         # Real Google Places API service
├── mock-places.service.ts    # Mock service for demo purposes
└── app.config.ts            # App configuration with HTTP client
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd bmo-autocomplete-poc
npm install
```

### 2. Configure Google Places API (For Production Use)

1. Get a Google Places API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Places API
   - Places API (New)
3. Configure API key restrictions (optional but recommended)
4. Replace `YOUR_GOOGLE_PLACES_API_KEY` in `src/app/places.service.ts`

### 3. Switch to Real API Service

To use the real Google Places API instead of mock data:

1. Open `src/app/app.component.ts`
2. Change the import:
   ```typescript
   // From:
   import { MockPlacesService, PlacePrediction, PlaceDetails } from './mock-places.service';
   
   // To:
   import { PlacesService, PlacePrediction, PlaceDetails } from './places.service';
   ```
3. Update the constructor:
   ```typescript
   // From:
   constructor(private readonly placesService: MockPlacesService) {}
   
   // To:
   constructor(private readonly placesService: PlacesService) {}
   ```

### 4. Run the Application

## Development server

To start a local development server, run:

```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Demo Mode

By default, the application runs with mock data that includes sample BMO locations:

- **123 Bay Street, Toronto, ON** - BMO Head Office
- **456 Main Street, Vancouver, BC** - BMO Vancouver Branch  
- **789 Queen Street West, Toronto, ON** - BMO Queen West Branch

Try typing "bay", "main", or "queen" to see the autocomplete in action.

## API Integration Notes

### CORS Considerations

The Google Places API has CORS restrictions. For production use, you'll need to:

1. **Use a backend proxy**: Create a server-side endpoint that calls the Google Places API
2. **Enable CORS**: Configure your server to handle CORS headers properly
3. **API Key Security**: Never expose API keys in frontend code - use environment variables and server-side calls

### Example Backend Integration

```typescript
// Example backend endpoint (Node.js/Express)
app.get('/api/places/autocomplete', async (req, res) => {
  const { input } = req.query;
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${API_KEY}`
  );
  const data = await response.json();
  res.json(data);
});
```

### Rate Limiting

Consider implementing rate limiting to:
- Prevent excessive API calls
- Manage costs
- Improve user experience

## Customization

### Styling
- Colors follow BMO brand guidelines (blue tones)
- Responsive design for mobile compatibility
- Hover and focus states for better UX

### Search Parameters
You can customize the search in `places.service.ts`:
- `types`: Filter by place types (e.g., 'address', 'establishment')
- `components`: Restrict to specific countries (currently CA|US)
- `location` + `radius`: Bias results to a specific area

### Debounce Timing
Adjust the debounce delay in `app.component.ts`:
```typescript
debounceTime(300) // Change to desired milliseconds
```

## Security Recommendations

1. **Never expose API keys** in frontend code
2. **Use environment variables** for configuration
3. **Implement rate limiting** on your backend
4. **Validate and sanitize** all user inputs
5. **Use HTTPS** in production

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## License

This is a proof-of-concept for BMO internal use.
