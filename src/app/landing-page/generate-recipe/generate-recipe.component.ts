import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject, switchMap, of } from 'rxjs';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-generate-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './generate-recipe.component.html',
  styleUrl: './generate-recipe.component.scss'
})
export class GenerateRecipeComponent {
  isDropdownOpen = false;
  selectedUnit = 'gram';
  units = ['gram', 'ml', 'piece'];
  
  listIngredients: Array<{
    amount: string,
    unit: string,
    name: string,
    isEditing?: boolean,
    isDropdownOpen?: boolean,
    isDeleting?: boolean,
    isAmountInvalid?: boolean
  }> = [];
  
  selectedServingSize = '';
  servingSizeInvalid = false;

  ingredientInput = '';
  suggestions: string[] = [];
  showSuggestions = false;
  private searchSubject = new Subject<string>();
  private cache = new Map<string, string[]>();

  getDisplayUnit(unit: string): string {
    switch(unit) {
      case 'gram': return 'g';
      case 'ml': return 'ml';
      case 'piece': return '';
      default: return unit;
    }
  }

  private commonIngredients: { [key: string]: string[] } = {
    'a': ['Apple', 'Avocado', 'Asparagus', 'Almond', 'Anchovy', 'Artichoke'],
    'b': ['Banana', 'Basil', 'Broccoli', 'Butter', 'Beef', 'Bacon', 'Bell Pepper'],
    'c': ['Carrot', 'Cheese', 'Chicken', 'Celery', 'Cucumber', 'Coconut', 'Cream'],
    'd': ['Date', 'Dill', 'Duck', 'Dried Fruit'],
    'e': ['Egg', 'Eggplant', 'Endive'],
    'f': ['Fig', 'Fennel', 'Fish', 'Flour'],
    'g': ['Garlic', 'Ginger', 'Grape', 'Green Beans'],
    'h': ['Honey', 'Ham', 'Herbs'],
    'i': ['Ice Cream', 'Iceberg Lettuce', 'Italian Sausage'],
    'j': ['Jam', 'Jalapeño', 'Juice'],
    'k': ['Kale', 'Ketchup', 'Kidney Beans'],
    'l': ['Lemon', 'Lettuce', 'Lime', 'Leek'],
    'm': ['Milk', 'Mushroom', 'Mustard', 'Meat', 'Mozzarella'],
    'n': ['Noodles', 'Nutmeg', 'Nuts'],
    'o': ['Onion', 'Orange', 'Oregano', 'Olive Oil', 'Olives'],
    'p': ['Pasta', 'Pepper', 'Potato', 'Pork', 'Parsley', 'Peas'],
    'q': ['Quinoa', 'Quail', 'Quince'],
    'r': ['Rice', 'Rosemary', 'Radish', 'Red Onion'],
    's': ['Salt', 'Sugar', 'Spinach', 'Salmon', 'Shrimp', 'Soy Sauce'],
    't': ['Tomato', 'Thyme', 'Tofu', 'Turkey', 'Turmeric'],
    'u': ['Udon Noodles', 'Ube', 'Urad Dal'],
    'v': ['Vanilla', 'Vinegar', 'Vegetable Oil'],
    'w': ['Watermelon', 'Walnut', 'Wheat', 'White Rice'],
    'x': ['Xanthan Gum', 'Xinomavro Grape', 'Ximenia'],
    'y': ['Yogurt', 'Yam', 'Yellow Pepper'],
    'z': ['Zucchini', 'Zest', 'Za\'atar']
  };

  constructor(private http: HttpClient) {
    this.searchSubject.pipe(
      debounceTime(400),
      switchMap(value => {
        console.log('Search value:', value);
        
        // Leer? Nichts tun
        if (value.length === 0) {
          this.showSuggestions = false;
          this.suggestions = [];
          return of(null);
        }

        const firstLetter = value.toLowerCase()[0];

        // Lokale Liste für 1-2 Buchstaben
        if (value.length <= 2) {
          if (this.commonIngredients[firstLetter]) {
            this.suggestions = this.commonIngredients[firstLetter];
            this.showSuggestions = this.suggestions.length > 0;
            console.log('Local suggestions:', this.suggestions);
          } else {
            this.suggestions = [];
            this.showSuggestions = false;
          }
          return of(null);
        }

        // Cache Check
        if (this.cache.has(value.toLowerCase())) {
          console.log('From cache:', value);
          this.suggestions = this.cache.get(value.toLowerCase())!;
          this.showSuggestions = this.suggestions.length > 0;
          return of(null);
        }

        // AI erst ab 3 Buchstaben
        console.log('Calling AI for:', value);
        return this.http.post<any>(
          'http://localhost:5678/webhook/ingredient-suggestions',
          { input: value }
        );
      })
    ).subscribe({
      next: (response) => {
        if (!response) return;

        console.log('Response from n8n:', response);

        if (response && response.output) {
          try {
            this.suggestions = JSON.parse(response.output);
            
            if (this.ingredientInput) {
              this.cache.set(this.ingredientInput.toLowerCase(), this.suggestions);
            }

            this.showSuggestions = this.suggestions.length > 0;
            console.log('Parsed suggestions:', this.suggestions);
          } catch (e) {
            console.error('Parse error:', e);
            this.suggestions = [];
            this.showSuggestions = false;
          }
        }
      },
      error: (error) => {
        console.error('Error:', error);
        this.suggestions = [];
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

  onIngredientInput(event: any) {
    const value = event.target.value;
    this.ingredientInput = value;
    this.searchSubject.next(value);
  }

  // NEU: Nur Zahlen erlauben
  onServingSizeInput(event: any) {
    let value = event.target.value;
    // Entferne alle Nicht-Zahlen
    value = value.replace(/[^0-9]/g, '');
    this.selectedServingSize = value;
    this.servingSizeInvalid = false;
  }

  // NEU: Nur Zahlen im Edit-Modus
  onEditAmountInput(event: any, index: number) {
    let value = event.target.value;
    // Entferne alle Nicht-Zahlen
    value = value.replace(/[^0-9]/g, '');
    this.listIngredients[index].amount = value;
    this.listIngredients[index].isAmountInvalid = false;
    // Setze den Input-Wert direkt
    event.target.value = value;
  }

  selectSuggestion(suggestion: string) {
  this.ingredientInput = suggestion;
  this.showSuggestions = false;
}

// NEU: Zeige nur die ersten 3 Vorschläge
get limitedSuggestions(): string[] {
  return this.suggestions.slice(0, 3);
}

  closeSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  addIngredient() {
    // Validierung
    if (!this.selectedServingSize || this.selectedServingSize.trim() === '') {
      this.servingSizeInvalid = true;
      return;
    }

    if (this.ingredientInput.trim() && this.selectedServingSize) {
      this.listIngredients.push({
        amount: this.selectedServingSize,
        unit: this.selectedUnit,
        name: this.ingredientInput,
        isEditing: false,
        isDropdownOpen: false,
        isDeleting: false
      });
      
      this.ingredientInput = '';
      this.selectedServingSize = '';
      this.servingSizeInvalid = false;
      this.showSuggestions = false;
    }
  }

  // GEÄNDERT: Mit Delete-Animation
  deleteIngredient(index: number) {
    this.listIngredients[index].isDeleting = true;
    
    setTimeout(() => {
      this.listIngredients.splice(index, 1);
    }, 300);
  }

  editIngredient(index: number) {
    this.listIngredients[index].isEditing = true;
  }

  saveIngredient(index: number) {
    // Validierung: Amount darf nicht leer sein
    if (!this.listIngredients[index].amount || this.listIngredients[index].amount.trim() === '') {
      this.listIngredients[index].isAmountInvalid = true;
      return;
    }

    this.listIngredients[index].isEditing = false;
    this.listIngredients[index].isDropdownOpen = false;
    this.listIngredients[index].isAmountInvalid = false;
  }

  toggleEditDropdown(index: number) {
    this.listIngredients[index].isDropdownOpen = !this.listIngredients[index].isDropdownOpen;
  }

  selectEditUnit(index: number, unit: string) {
    this.listIngredients[index].unit = unit;
    this.listIngredients[index].isDropdownOpen = false;
  }
}