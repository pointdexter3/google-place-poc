import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutocompleteInputComponent } from './autocomplete-input.component';
import { PlaceDetails } from './google-maps.consts';

@Component({
  selector: 'app-place-autocomplete-page',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>BMO Global Money Transfer</h1>
        <p class="subtitle">Address Autocomplete POC</p>
      </div>

      <div class="page-content">
        <app-autocomplete-input
          (placeSelected)="onPlaceSelected($event)">
        </app-autocomplete-input>

        <div *ngIf="selectedAddress" class="selected-address-summary">
          <h3>Selected Address Summary:</h3>
          <div class="address-card">
            <div class="address-formatted">{{ selectedAddress.formattedAddress }}</div>

            <h2>Address Components:</h2>
            <div class="address-components-grid">
              <div class="address-components-column">
                <h3>In Formatted Address</h3>
                <div *ngFor="let addressComponent of selectedAddress.addressComponentsInFormattedAddress" class="address-component">
                  <div class="address-name">{{ addressComponent.type }}</div>
                  <div class="address-formatted">{{ addressComponent.formattedText }}</div>
                </div>
              </div>

              <div class="address-components-column">
                <h3>All Components (Raw)</h3>
                <div *ngFor="let addressComponent of selectedAddress.addressComponentsRaw" class="address-component">
                  <div class="address-name">{{ addressComponent.type }}</div>
                  <div class="address-formatted">{{ addressComponent.longText || addressComponent.shortText }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .page-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .page-header h1 {
      font-size: 2.5rem;
      color: #333;
      margin: 0 0 10px 0;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin: 0;
    }

    .page-content {
      background: #f8f9fa;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #e9ecef;
    }

    .selected-address-summary {
      margin-top: 30px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }

    .selected-address-summary h3 {
      margin: 0 0 15px 0;
      color: #495057;
      font-size: 1.2rem;
    }

    .address-card {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .address-name {
      font-weight: 600;
      font-size: 1.1rem;
      color: #495057;
      margin-bottom: 8px;
    }

    .address-formatted {
      color: #6c757d;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .address-coordinates {
      font-size: 0.9rem;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .address-id {
      font-size: 0.8rem;
      color: #adb5bd;
      font-family: monospace;
    }

    .address-components-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 15px;
    }

    .address-components-column {
      background: white;
      padding: 15px;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .address-components-column h3 {
      margin: 0 0 15px 0;
      font-size: 1rem;
      color: #495057;
      border-bottom: 2px solid #007bff;
      padding-bottom: 8px;
    }

    .address-component {
      margin-bottom: 10px;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
      border-left: 3px solid #28a745;
    }

    .address-component:last-child {
      margin-bottom: 0;
    }

    .address-component .address-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #495057;
      margin-bottom: 4px;
    }

    .address-component .address-formatted {
      font-size: 0.85rem;
      color: #6c757d;
      margin-bottom: 0;
    }

    @media (max-width: 768px) {
      .address-components-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  imports: [CommonModule, AutocompleteInputComponent],
  standalone: true
})
export class PlaceAutocompletePageComponent {
  selectedAddress: PlaceDetails | null = null;

  onPlaceSelected(place: PlaceDetails): void {
    console.log('Place selected in page component:', place);
    this.selectedAddress = place;
  }
}
