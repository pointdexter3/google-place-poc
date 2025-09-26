import { Injectable } from '@angular/core';
import { GOOGLE_PLACES_API_KEY } from './api-key.consts';

declare global {
  interface Window {
    google: any;
  }
}

// google.maps.GeocoderAddressComponent interface
interface GeocoderResult {
  longText: string;
  shortText: string;
  types: string[];
}

const addressTypes = [
  'street_number',
  'street_address', // A precise street address.
  'route', // A named route (such as "US 101").
  'intersection', // A major intersection, usually of two major roads.
  'political', //A political entity. Usually, this type indicates a polygon of some civil administration.
  'country', // The national political entity, and is typically the highest order type returned by the Geocoder.
  'administrative_area_level_1', // A first-order civil entity below the country level. Within the United States, these administrative levels are states. Not all nations exhibit these administrative levels. In most cases, administrative_area_level_1 short names will closely match ISO 3166-2 subdivisions and other widely circulated lists; however this is not guaranteed as our geocoding results are based on a variety of signals and location data.
  'administrative_area_level_2', // A second-order civil entity below the country level. Within the United States, these administrative levels are counties. Not all nations exhibit these administrative levels.
  'administrative_area_level_3', // A third-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  'administrative_area_level_4', // A fourth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  'administrative_area_level_5', // A fifth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  'administrative_area_level_6', // A sixth-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  'administrative_area_level_7', // A seventh-order civil entity below the country level. This type indicates a minor civil division. Not all nations exhibit these administrative levels.
  'locality', //An incorporated city or town political entity.
  'sublocality', //A first-order civil entity below a locality. For some locations may receive one of the additional types: sublocality_level_1 to sublocality_level_5. Each sublocality level is a civil entity. Larger numbers indicate a smaller geographic area.
  'premise', //A named location, usually a building or collection of buildings with a common name
  'subpremise', //An addressable entity below the premise level, such as an apartment, unit, or suite.
  'plus_code', // An encoded location reference, derived from latitude and longitude. Plus codes can be used as a replacement for street addresses in places where they do not exist (where buildings are not numbered or streets are not named). See https://plus.codes for details.
  'postal_code', // A postal code as used to address postal mail within the country.
];

export interface PlacePrediction {
  placeId: string;
  addressText: string;
  place: any; // The Place instance associated with this prediction
}

export interface PlaceDetails {
  placeId?: string;
  displayName?: string;
  formattedAddress?: string;
  location?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsAutocompleteService {
  private isInitialized = false;
  private Place: any;
  private AutocompleteSessionToken: any;
  private AutocompleteSuggestion: any;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.loadGoogleMapsScript();

    // Import the Places library classes
    const placesLibrary = await window.google.maps.importLibrary('places');
    this.Place = placesLibrary.Place;
    this.AutocompleteSessionToken = placesLibrary.AutocompleteSessionToken;
    this.AutocompleteSuggestion = placesLibrary.AutocompleteSuggestion;

    this.isInitialized = true;
  }

  async getAutocompleteSuggestions(input: string): Promise<PlacePrediction[]> {
    await this.initialize();

    // Create a session token for this autocomplete session
    const token = new this.AutocompleteSessionToken();

    // Build the request
    const request = {
      input: input,
      sessionToken: token,
      language: 'en-US',
      region: 'us',
    };

    try {
      console.log('Making autocomplete request with:', request);

      // Fetch autocomplete suggestions
      const { suggestions } =
        await this.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      console.log('suggestion:', suggestions);

      const mappedSuggestions = suggestions.map((suggestion: any) => {
        const place = suggestion.placePrediction.toPlace(); // Each suggestion gets its own unique place
        return {
          placeId: suggestion.placePrediction.placeId,
          addressText: suggestion.placePrediction.text.toString(),
          place: place,
        };
      });

      console.log('result:', mappedSuggestions);

      return mappedSuggestions;
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      return [];
    }
  }

  async getPlaceDetails(
    placePrediction: PlacePrediction
  ): Promise<PlaceDetails | null> {
    await this.initialize();

    try {
      await placePrediction.place.fetchFields({
        fields: [
          // 'placeId',
          'formattedAddress',
          'postalAddress',
          'location',
          'displayName',
          'addressComponents',
        ],
      });
      console.log('Place details fields:', placePrediction.place);

      console.log(
        'Place details fields:',
        placePrediction.place.formattedAddress,
        ' ',
        placePrediction.place.location,
        ' ',
        placePrediction.place.displayName,
        ' addressComponents: ',
        placePrediction.place.addressComponents.types
      );

      // https://developers.google.com/maps/documentation/javascript/geocoding?_gl=1*8iubjt*_up*MQ..*_ga*MTM1NjY4Mjk5NS4xNzU4ODk5OTcw*_ga_NRWSTWS78N*czE3NTg5MDIwMjUkbzIkZzEkdDE3NTg5MDIwNjQkajIxJGwwJGgw#address-types
      const addressComponents = placePrediction.place.addressComponents;

      // After fetchFields has populated the place object
      if (addressComponents) {
        console.log('Mapping address components...', addressComponents);
        addressTypes.forEach((type) => {
          const value = this.getAddressComponent(addressComponents, type);
          if (value) {
            placePrediction.place[type] = value;
            console.log('Mapped: ', type, 'to: ', value);
          }
        });
      }

      return {
        placeId: placePrediction.place.placeId,
        formattedAddress: placePrediction.place.formattedAddress,
      };
    } catch (error) {
      console.error('Error fetching place details:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      return null;
    }
  }

  getAddressComponent(
    addressComponents: GeocoderResult[],
    type: string
  ): string | null {
    const component = addressComponents?.find((comp: GeocoderResult) =>
      comp.types.includes(type)
    );
    return component?.longText || component?.shortText || null;
  }

  private async loadGoogleMapsScript(): Promise<void> {
    // Check if Google Maps API is already loaded
    if (window.google?.maps?.importLibrary) {
      await window.google.maps.importLibrary('places');
      return;
    }

    // Initialize Google Maps API using official bootstrap code
    await this.initializeGoogleMapsBootstrap();

    // Import places library
    await window.google.maps.importLibrary('places');
  }

  private async initializeGoogleMapsBootstrap(): Promise<void> {
    // Import and execute the exact Google Maps bootstrap from dedicated file
    const { initializeGoogleMaps } = await import('./google-maps-bootstrap.js');
    initializeGoogleMaps(GOOGLE_PLACES_API_KEY, 'weekly');

    // Wait for Google Maps to be available
    return this.waitForGoogleMapsToLoad();
  }

  private waitForGoogleMapsToLoad(): Promise<void> {
    return new Promise((resolve, reject) => {
      const checkGoogleMaps = () => {
        if (window.google?.maps?.importLibrary) {
          resolve();
        } else {
          setTimeout(checkGoogleMaps, 100);
        }
      };

      // Start checking immediately
      checkGoogleMaps();

      // Set a timeout to avoid infinite waiting
      setTimeout(() => {
        reject(new Error('Google Maps failed to load within 10 seconds'));
      }, 10000);
    });
  }
}
