# Production Implementation Guide

## Switching from Mock to Real Google Places API

### Step 1: Obtain Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Places API
   - Places API (New) 
4. Go to "Credentials" and create an API key
5. (Recommended) Restrict the API key:
   - Application restrictions: HTTP referrers
   - API restrictions: Select only Places API

### Step 2: Update the Application

1. **Replace the service import in `app.component.ts`:**
   ```typescript
   // Change from:
   import { MockPlacesService, PlacePrediction, PlaceDetails } from './mock-places.service';
   
   // To:
   import { PlacesService, PlacePrediction, PlaceDetails } from './places.service';
   ```

2. **Update the constructor:**
   ```typescript
   // Change from:
   constructor(private readonly placesService: MockPlacesService) {}
   
   // To:
   constructor(private readonly placesService: PlacesService) {}
   ```

3. **Add your API key to `places.service.ts`:**
   ```typescript
   private readonly API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
   ```

### Step 3: Handle CORS Issues

Since the Google Places API doesn't support CORS for web applications, you'll need a backend proxy:

#### Option A: Node.js/Express Backend

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Autocomplete endpoint
app.get('/api/places/autocomplete', async (req, res) => {
  try {
    const { input, types = 'address', components = 'country:ca|country:us' } = req.query;
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=${types}&components=${components}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch predictions' });
  }
});

// Place details endpoint
app.get('/api/places/details', async (req, res) => {
  try {
    const { place_id, fields = 'place_id,formatted_address,name,geometry,types,address_components' } = req.query;
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${GOOGLE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch place details' });
  }
});

app.listen(3000, () => {
  console.log('Proxy server running on port 3000');
});
```

#### Option B: Update Angular Service for Backend

```typescript
// Update places.service.ts to use your backend
export class PlacesService {
  private readonly BACKEND_URL = 'http://localhost:3000/api'; // Your backend URL

  getPlacePredictions(input: string): Observable<PlaceAutocompleteResponse> {
    const url = `${this.BACKEND_URL}/places/autocomplete`;
    const params = {
      input: input,
      types: 'address',
      components: 'country:ca|country:us'
    };

    return this.http.get<PlaceAutocompleteResponse>(url, { params });
  }

  getPlaceDetails(placeId: string): Observable<PlaceDetailsResponse> {
    const url = `${this.BACKEND_URL}/places/details`;
    const params = {
      place_id: placeId,
      fields: 'place_id,formatted_address,name,geometry,types,address_components'
    };

    return this.http.get<PlaceDetailsResponse>(url, { params });
  }
}
```

## Advanced Features

### Rate Limiting

Implement rate limiting to control API usage:

```typescript
// In your component
private requestCount = 0;
private readonly MAX_REQUESTS_PER_MINUTE = 60;

onSearchChange(query: string) {
  if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
    this.error = 'Too many requests. Please wait before searching again.';
    return;
  }
  
  this.requestCount++;
  setTimeout(() => this.requestCount--, 60000); // Reset after 1 minute
  
  this.searchQuery = query;
  this.searchSubject.next(query);
}
```

### Caching

Add simple caching to reduce API calls:

```typescript
// In your service
private cache = new Map<string, PlaceAutocompleteResponse>();
private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

getPlacePredictions(input: string): Observable<PlaceAutocompleteResponse> {
  const cacheKey = input.toLowerCase();
  const cached = this.cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
    return of(cached.data);
  }
  
  return this.http.get<PlaceAutocompleteResponse>(url, { params }).pipe(
    tap(response => {
      this.cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
    })
  );
}
```

### Environment Configuration

Use Angular environments for different configurations:

```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googlePlacesApiKey: 'your-dev-api-key'
};

// environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-backend.com/api',
  googlePlacesApiKey: 'your-prod-api-key'
};

// In your service
import { environment } from '../environments/environment';

export class PlacesService {
  private readonly API_URL = environment.apiUrl;
  private readonly API_KEY = environment.googlePlacesApiKey;
}
```

## Cost Optimization

1. **Use session tokens** for place details requests
2. **Implement proper debouncing** (300-500ms)
3. **Cache frequent searches**
4. **Set appropriate query restrictions** (country, type)
5. **Monitor usage** in Google Cloud Console

## Security Checklist

- [ ] API key never exposed in frontend code
- [ ] Rate limiting implemented
- [ ] Input validation on backend
- [ ] HTTPS used in production
- [ ] API key restrictions configured
- [ ] Error handling doesn't expose sensitive info
- [ ] CORS properly configured

## Testing

### Unit Tests

```typescript
// app.component.spec.ts
describe('AppComponent', () => {
  it('should debounce search input', fakeAsync(() => {
    const searchSpy = spyOn(component, 'onSearchChange');
    
    component.searchQuery = 'test';
    tick(100);
    expect(searchSpy).not.toHaveBeenCalled();
    
    tick(300);
    expect(searchSpy).toHaveBeenCalled();
  }));
});
```

### E2E Tests

```typescript
// cypress/e2e/autocomplete.cy.ts
describe('Address Autocomplete', () => {
  it('should show predictions when typing', () => {
    cy.visit('/');
    cy.get('.search-input').type('123 Bay');
    cy.get('.prediction-item').should('be.visible');
    cy.get('.prediction-item').first().click();
    cy.get('.selected-address').should('be.visible');
  });
});
```

## Performance Monitoring

Monitor key metrics:
- API response times
- Cache hit rates
- Error rates
- User engagement with predictions

## Deployment

For production deployment:
1. Build with `ng build --prod`
2. Deploy static files to CDN
3. Deploy backend proxy to secure server
4. Configure monitoring and logging
5. Set up SSL certificates
6. Configure domain and DNS
