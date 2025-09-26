import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
export class ProxyPlacesService {
  private readonly BACKEND_URL = 'http://localhost:3000/api';

  constructor(private readonly http: HttpClient) { }

  // Get autocomplete predictions via backend proxy
  getPlacePredictions(input: string): Observable<PlaceAutocompleteResponse> {
    const url = `${this.BACKEND_URL}/places/autocomplete`;
    const body = {
      input: input,
      types: 'address',
      components: 'country:ca|country:us' // Restrict to Canada and US for BMO
    };

    return this.http.post<PlaceAutocompleteResponse>(url, body);
  }

  // Get place details by place_id via backend proxy
  getPlaceDetails(placeId: string): Observable<PlaceDetailsResponse> {
    const url = `${this.BACKEND_URL}/places/details`;
    const body = {
      place_id: placeId
    };

    return this.http.post<PlaceDetailsResponse>(url, body);
  }
}
