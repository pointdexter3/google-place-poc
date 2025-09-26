import { Component } from '@angular/core';
import { PlaceAutocompletePageComponent } from './place-autocomplete-page.component';

@Component({
  selector: 'app-root',
  imports: [PlaceAutocompletePageComponent],
  template: `
    <app-place-autocomplete-page></app-place-autocomplete-page>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
    }
  `],
})
export class AppComponent {
  title = 'BMO Place Autocomplete POC';
}
