import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Mock data interfaces (same as real service)
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
export class MockPlacesService {

  private readonly mockPredictions: PlacePrediction[] = [
    {
      description: "123 Bay Street, Toronto, ON, Canada",
      matched_substrings: [],
      place_id: "mock_place_1",
      reference: "mock_ref_1",
      structured_formatting: {
        main_text: "123 Bay Street",
        secondary_text: "Toronto, ON, Canada"
      },
      terms: [],
      types: ["street_address"]
    },
    {
      description: "456 Main Street, Vancouver, BC, Canada",
      matched_substrings: [],
      place_id: "mock_place_2",
      reference: "mock_ref_2",
      structured_formatting: {
        main_text: "456 Main Street",
        secondary_text: "Vancouver, BC, Canada"
      },
      terms: [],
      types: ["street_address"]
    },
    {
      description: "789 Queen Street West, Toronto, ON, Canada",
      matched_substrings: [],
      place_id: "mock_place_3",
      reference: "mock_ref_3",
      structured_formatting: {
        main_text: "789 Queen Street West",
        secondary_text: "Toronto, ON, Canada"
      },
      terms: [],
      types: ["street_address"]
    }
  ];

  private readonly mockPlaceDetails: Record<string, PlaceDetails> = {
    "mock_place_1": {
      place_id: "mock_place_1",
      formatted_address: "123 Bay Street, Toronto, ON M5H 2Y4, Canada",
      name: "BMO Head Office",
      geometry: {
        location: {
          lat: 43.6532,
          lng: -79.3832
        }
      },
      types: ["establishment", "finance", "bank"],
      address_components: [
        {
          long_name: "123",
          short_name: "123",
          types: ["street_number"]
        },
        {
          long_name: "Bay Street",
          short_name: "Bay St",
          types: ["route"]
        },
        {
          long_name: "Toronto",
          short_name: "Toronto",
          types: ["locality", "political"]
        },
        {
          long_name: "Ontario",
          short_name: "ON",
          types: ["administrative_area_level_1", "political"]
        },
        {
          long_name: "Canada",
          short_name: "CA",
          types: ["country", "political"]
        },
        {
          long_name: "M5H 2Y4",
          short_name: "M5H 2Y4",
          types: ["postal_code"]
        }
      ]
    },
    "mock_place_2": {
      place_id: "mock_place_2",
      formatted_address: "456 Main Street, Vancouver, BC V6A 2T7, Canada",
      name: "BMO Vancouver Branch",
      geometry: {
        location: {
          lat: 49.2827,
          lng: -123.1207
        }
      },
      types: ["establishment", "finance", "bank"],
      address_components: [
        {
          long_name: "456",
          short_name: "456",
          types: ["street_number"]
        },
        {
          long_name: "Main Street",
          short_name: "Main St",
          types: ["route"]
        },
        {
          long_name: "Vancouver",
          short_name: "Vancouver",
          types: ["locality", "political"]
        },
        {
          long_name: "British Columbia",
          short_name: "BC",
          types: ["administrative_area_level_1", "political"]
        },
        {
          long_name: "Canada",
          short_name: "CA",
          types: ["country", "political"]
        },
        {
          long_name: "V6A 2T7",
          short_name: "V6A 2T7",
          types: ["postal_code"]
        }
      ]
    },
    "mock_place_3": {
      place_id: "mock_place_3",
      formatted_address: "789 Queen Street West, Toronto, ON M6J 1G1, Canada",
      name: "BMO Queen West Branch",
      geometry: {
        location: {
          lat: 43.6471,
          lng: -79.4041
        }
      },
      types: ["establishment", "finance", "bank"],
      address_components: [
        {
          long_name: "789",
          short_name: "789",
          types: ["street_number"]
        },
        {
          long_name: "Queen Street West",
          short_name: "Queen St W",
          types: ["route"]
        },
        {
          long_name: "Toronto",
          short_name: "Toronto",
          types: ["locality", "political"]
        },
        {
          long_name: "Ontario",
          short_name: "ON",
          types: ["administrative_area_level_1", "political"]
        },
        {
          long_name: "Canada",
          short_name: "CA",
          types: ["country", "political"]
        },
        {
          long_name: "M6J 1G1",
          short_name: "M6J 1G1",
          types: ["postal_code"]
        }
      ]
    }
  };

  constructor() { }

  // Mock autocomplete predictions
  getPlacePredictions(input: string): Observable<PlaceAutocompleteResponse> {
    if (input.length < 3) {
      return of({ predictions: [], status: 'OK' });
    }

    // Filter predictions based on input
    const filteredPredictions = this.mockPredictions.filter(prediction =>
      prediction.description.toLowerCase().includes(input.toLowerCase())
    );

    return of({
      predictions: filteredPredictions,
      status: 'OK'
    }).pipe(delay(500)); // Simulate network delay
  }

  // Mock place details
  getPlaceDetails(placeId: string): Observable<PlaceDetailsResponse> {
    const result = this.mockPlaceDetails[placeId];

    if (result) {
      return of({
        result: result,
        status: 'OK'
      }).pipe(delay(300)); // Simulate network delay
    } else {
      return of({
        result: null as any,
        status: 'NOT_FOUND'
      });
    }
  }
}
