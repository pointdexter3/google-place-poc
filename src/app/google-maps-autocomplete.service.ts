import { Injectable } from '@angular/core';
import { GOOGLE_PLACES_API_KEY } from './api-key.consts';
import {
  PlacePrediction,
  PlaceDetails,
  addressTypes,
  GeocoderResult,
  AddressComponent,
  AddressType,
} from './google-maps.consts';

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsAutocompleteService {
  private isInitialized = false;

  private AutocompleteSessionToken: any;
  private AutocompleteSuggestion: any;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    await this.loadGoogleMapsScript();

    // Import the Places library classes
    const placesLibrary = await window.google.maps.importLibrary('places');

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
      language: 'en-CA',
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
          // google stresses that formattedAddress should NOT be parsed. Use address components instead.
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

      const addressComponentsRaw: AddressComponent[] = [];
      let addressComponentsInFormattedAddress: AddressComponent[] = [];

      // After fetchFields has populated the place object
      if (addressComponents) {
        console.log('Mapping address components...', addressComponents);
        const formattedAddress = placePrediction.place.formattedAddress || '';

        addressTypes.forEach((type) => {
          const addressComponent = this.getAddressComponent(
            addressComponents,
            type,
            formattedAddress
          );
          if (addressComponent) {
            placePrediction.place[type] = addressComponent;
            addressComponentsRaw.push(addressComponent);

            addressComponentsInFormattedAddress = addressComponentsRaw.filter(
              (ac) => !!ac.formattedText
            );
          }
        });
      }

      return {
        formattedAddress: placePrediction.place.formattedAddress,
        addressComponentsInFormattedAddress,
        addressComponentsRaw,
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

  // Helper to extract specific address components
  // "Address types and address component types": https://developers.google.com/maps/documentation/javascript/geocoding?_gl=1*8iubjt*_up*MQ..*_ga*MTM1NjY4Mjk5NS4xNzU4ODk5OTcw*_ga_NRWSTWS78N*czE3NTg5MDIwMjUkbzIkZzEkdDE3NTg5MDIwNjQkajIxJGwwJGgw#address-types
  getAddressComponent(
    addressComponents: GeocoderResult[],
    type: AddressType,
    formattedAddress: string
  ): AddressComponent | null {
    const component = addressComponents?.find((comp: GeocoderResult) =>
      comp.types.includes(type)
    );
    return {
      type: type,
      formattedText:
        this.getFoundInFormattedAddress(
          component?.longText,
          formattedAddress
        ) ||
        this.getFoundInFormattedAddress(
          component?.shortText,
          formattedAddress
        ) ||
        undefined,
      longText: component?.longText || undefined,
      shortText: component?.shortText || undefined,
    };
  }

  getFoundInFormattedAddress(
    text: string | undefined,
    formattedAddress: string
  ): string | undefined {
    return text && formattedAddress.includes(text) ? text : undefined;
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
