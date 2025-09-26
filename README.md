# BMO Places Autocomplete POC

A proof-of-concept Angular 19 application demonstrating address autocomplete functionality using Google Places API for BMO.


## OTHER BANKS
- **TD** https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service (DEPRECATED)
- **TANGERINE** https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service (DEPRECATED)

## Features

- **Real-time Address Search**: Type-ahead search with debounced input (300ms delay)
- **Interactive Predictions**: Click on address suggestions to get detailed information
- **Comprehensive Address Details**: Shows formatted address, place types, and address components

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
4. Create a file `src/app/api-key.consts.ts` and add your API key:

```typescript
export const GOOGLE_PLACES_API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';
```

### 4. Run the Application

## Development server

To start a local development server, run:

```bash
ng serve
```

The application will be available at `http://localhost:4200`

