import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GOOGLE_PLACES_API_KEY } from './api-key.consts';

export interface PlacePrediction {
  description: string;
  matched_substrings: any[];
  place_id: string;
  reference: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  terms: any[];
  types: string[];
}

export interface PlaceAutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  types: string[];
  address_components: any[];
}

export interface PlaceDetailsResponse {
  result: PlaceDetails;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  // Note: In production, this should be stored securely and not exposed in frontend code
  // YOUR_GOOGLE_PLACES_API_KEY
  private readonly API_KEY = GOOGLE_PLACES_API_KEY;

  private readonly PLACES_API_URL = 'https://maps.googleapis.com/maps/api/place';

  constructor(private readonly http: HttpClient) { }

  // Get autocomplete predictions
  getPlacePredictions(input: string): Observable<PlaceAutocompleteResponse> {
    const url = `${this.PLACES_API_URL}/autocomplete/json`;
    const params = {
      input: input,
      key: this.API_KEY,
      types: 'address',
      components: 'country:ca|country:us' // Restrict to Canada and US for BMO
    };

    return this.http.get<PlaceAutocompleteResponse>(url, { params });
  }

  // Get place details by place_id
  getPlaceDetails(placeId: string): Observable<PlaceDetailsResponse> {
    const url = `${this.PLACES_API_URL}/details/json`;
    const params = {
      place_id: placeId,
      key: this.API_KEY,
      fields: 'place_id,formatted_address,name,geometry,types,address_components'
    };

    return this.http.get<PlaceDetailsResponse>(url, { params });
  }
}
