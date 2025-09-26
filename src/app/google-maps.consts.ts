declare global {
  interface Window {
    google: any;
  }
}

// google.maps.GeocoderAddressComponent interface
export interface GeocoderResult {
  longText: string;
  shortText: string;
  types: string[];
}

// List of address component types to extract from googles GeocoderResult
export const addressTypes = [
  'street_number',
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
] as const;

export interface PlacePrediction {
  placeId: string;
  addressText: string;
  place: any; // The Place instance associated with this prediction
}

export type AddressType = (typeof addressTypes)[number];

export interface AddressComponent {
  type: AddressType;
  formattedText?: string;
  shortText?: string;
  longText?: string;
}

export interface PlaceDetails {
  formattedAddress?: string;
  // All address components extracted from the place details
  addressComponentsRaw?: AddressComponent[];
  // Address components that are part of the formatted address
  addressComponentsInFormattedAddress?: AddressComponent[];
}
