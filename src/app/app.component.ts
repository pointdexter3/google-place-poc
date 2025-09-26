import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProxyPlacesService, PlacePrediction, PlaceDetails } from './proxy-places.service';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Subject, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BMO Place Autocomplete POC';
  searchQuery = '';
  predictions: PlacePrediction[] = [];
  selectedAddress: PlaceDetails | null = null;
  isLoading = false;
  error = '';

  private readonly searchSubject = new Subject<string>();

  constructor(private readonly placesService: ProxyPlacesService) {}

  ngOnInit() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(800), // Wait 800ms after user stops typing
      distinctUntilChanged(), // Only emit if value is different from previous
      switchMap((query: string) => {
        if (query.length < 3) {
          return of({ predictions: [], status: 'OK' });
        }
        this.isLoading = true;
        this.error = '';
        return this.placesService.getPlacePredictions(query).pipe(
          catchError(err => {
            console.error('Autocomplete error:', err);
            this.error = 'Failed to fetch predictions. Please check your API key and try again.';
            return of({ predictions: [], status: 'ERROR' });
          })
        );
      })
    ).subscribe((response: any) => {
      this.isLoading = false;
      this.predictions = response.predictions;
      if (response.status !== 'OK' && response.status !== 'ZERO_RESULTS') {
        this.error = `API Error: ${response.status}`;
      }
    });
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.searchSubject.next(query);

    // Clear previous results if query is too short
    if (query.length < 3) {
      this.predictions = [];
      this.selectedAddress = null;
    }
  }

  onPredictionClick(prediction: PlacePrediction) {
    this.isLoading = true;
    this.error = '';

    this.placesService.getPlaceDetails(prediction.place_id).pipe(
      catchError(err => {
        console.error('Place details error:', err);
        this.error = 'Failed to fetch place details. Please try again.';
        return of({ result: null, status: 'ERROR' });
      })
    ).subscribe((response: any) => {
      this.isLoading = false;
      if (response.result) {
        this.selectedAddress = response.result;
        this.searchQuery = response.result.formatted_address;
        this.predictions = []; // Clear predictions after selection
      } else {
        this.error = `Failed to get place details: ${response.status}`;
      }
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.predictions = [];
    this.selectedAddress = null;
    this.error = '';
  }

  trackByPlaceId(index: number, prediction: PlacePrediction): string {
    return prediction.place_id;
  }
}
