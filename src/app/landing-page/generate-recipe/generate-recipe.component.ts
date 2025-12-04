import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-generate-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-recipe.component.html',
  styleUrl: './generate-recipe.component.scss'
})
export class GenerateRecipeComponent {
  isDropdownOpen = false;
  selectedUnit = 'gram';
  units = ['gram', 'ml', 'piece'];

  // Neue Properties für Autocomplete
  ingredientInput = '';
  suggestions: string[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();

  constructor(private http: HttpClient) {
    // Debounce für API Calls (wartet 300ms nach dem letzten Tastendruck)
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(value => {
      if (value.length > 1) {
        this.getIngredientSuggestions(value);
      } else {
        this.showSuggestions = false;
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectUnit(unit: string) {
    this.selectedUnit = unit;
    this.isDropdownOpen = false;
  }

  // Wird bei jedem Tastendruck aufgerufen
  onIngredientInput(event: any) {
    const value = event.target.value;
    this.ingredientInput = value;
    this.searchSubject.next(value);
  }

  // API Call zu deinem n8n Webhook
  getIngredientSuggestions(input: string) {
    this.http.post<any>(
      'http://localhost:5678/webhook/ingredient-suggestions', // ← Deine Webhook URL hier
      { input: input }
    ).subscribe({
      next: (response) => {
        // Annahme: Response ist ein Array wie ["Pasta", "Pastrami", "Passionsfrucht"]
        this.suggestions = response && Array.isArray(response) ? response : [];
        this.showSuggestions = this.suggestions.length > 0;
      },
      error: (error) => {
        console.error('Error fetching suggestions:', error);
        this.suggestions = [];
        this.showSuggestions = false;
      }
    });
  }

  // Wenn User einen Vorschlag auswählt
  selectSuggestion(suggestion: string) {
    this.ingredientInput = suggestion;
    this.showSuggestions = false;
  }

  // Schließt Suggestions wenn irgendwo anders geklickt wird
  closeSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }
}