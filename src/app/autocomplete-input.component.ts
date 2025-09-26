import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMapsAutocompleteService } from './google-maps-autocomplete.service';
import { PlacePrediction, PlaceDetails } from './google-maps.consts';

@Component({
  selector: 'app-autocomplete-input',
  template: `
    <div class="input-container">
      <label class="input-label">Enter Address:</label>
      <div class="autocomplete-wrapper">
        <input
          #addressInput
          type="text"
          class="address-input"
          placeholder="Start typing an address..."
          [(ngModel)]="inputValue"
          (input)="onInputChange($event)"
          (keydown)="onKeyDown($event)"
          autocomplete="off"
        />

        <div *ngIf="predictions.length > 0 && showPredictions" class="predictions-dropdown">
          <div
            *ngFor="let prediction of predictions; let i = index"
            class="prediction-item"
            [class.selected]="i === selectedIndex"
            (click)="selectPrediction(prediction)"
            (mouseenter)="selectedIndex = i"
          >
            <div class="secondary-text">{{ prediction.addressText }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .input-container {
      width: 100%;
    }

    .input-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #495057;
      font-size: 1rem;
    }

    .selected-place-info {
      margin-top: 20px;
      padding: 15px;
      background: white;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .selected-place-info h3 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 1.1rem;
    }

    .selected-place-info pre {
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #e9ecef;
      font-size: 0.85rem;
      overflow-x: auto;
      margin: 0;
    }
    .autocomplete-wrapper {
      position: relative;
    }

    .address-input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 1rem;
      transition: border-color 0.2s ease;
    }

    .address-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .predictions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #e9ecef;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .prediction-item {
      padding: 12px;
      cursor: pointer;
      border-bottom: 1px solid #f8f9fa;
    }

    .prediction-item:hover,
    .prediction-item.selected {
      background-color: #f8f9fa;
    }

    .main-text {
      font-weight: 600;
      color: #495057;
    }

    .secondary-text {
      font-size: 0.9rem;
      color: #6c757d;
      margin-top: 2px;
    }

    .place-details {
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .place-details > div {
      margin-bottom: 5px;
    }
  `],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class AutocompleteInputComponent {
  @Output() placeSelected = new EventEmitter<PlaceDetails>();

  inputValue = '';
  predictions: PlacePrediction[] = [];
  selectedPlace: PlaceDetails | null = null;
  showPredictions = false;
  selectedIndex = -1;
  private debounceTimer: any;

  constructor(private readonly autocompleteService: GoogleMapsAutocompleteService) {}

  onInputChange(event: any): void {
    const input = event.target.value;
    this.inputValue = input;

    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the search
    this.debounceTimer = setTimeout(async () => {
      if (input.length >= 2) {
        this.predictions = await this.autocompleteService.getAutocompleteSuggestions(input);
        this.showPredictions = true;
        this.selectedIndex = -1;
      } else {
        this.predictions = [];
        this.showPredictions = false;
      }
    }, 300);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (!this.showPredictions || this.predictions.length === 0) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.predictions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0) {
          this.selectPrediction(this.predictions[this.selectedIndex]);
        }
        break;
      case 'Escape':
        this.showPredictions = false;
        this.selectedIndex = -1;
        break;
    }
  }

  async selectPrediction(prediction: PlacePrediction): Promise<void> {
    this.inputValue = prediction.addressText;
    this.showPredictions = false;
    this.predictions = [];
    this.selectedIndex = -1;

    // Fetch place details
    const placeDetails = await this.autocompleteService.getPlaceDetails(prediction);
    if (placeDetails) {
      this.selectedPlace = placeDetails;
      this.placeSelected.emit(placeDetails);
    }
  }
}
