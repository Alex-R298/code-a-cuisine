import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, Subject, switchMap, of } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-generate-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [RecipeService],
  templateUrl: './generate-recipe.component.html',
  styleUrl: './generate-recipe.component.scss'
})
export class GenerateRecipeComponent implements OnInit {
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
  currentRecipeId: string | null = null;  // NEU

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

  constructor(
    private http: HttpClient,
    private recipeService: RecipeService,
    private router: Router,
    private route: ActivatedRoute  // NEU
  ) {
    this.searchSubject.pipe(
      debounceTime(400),
      switchMap(value => {
        console.log('Search value:', value);
        
        if (value.length === 0) {
          this.showSuggestions = false;
          this.suggestions = [];
          return of(null);
        }

        const firstLetter = value.toLowerCase()[0];

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

        if (this.cache.has(value.toLowerCase())) {
          console.log('From cache:', value);
          this.suggestions = this.cache.get(value.toLowerCase())!;
          this.showSuggestions = this.suggestions.length > 0;
          return of(null);
        }

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

  // NEU: Lifecycle Hook
  async ngOnInit() {
    // Check ob wir eine Recipe ID haben (wenn User zurück kommt)
    const recipeId = this.route.snapshot.queryParams['recipeId'];
    
    if (recipeId) {
      console.log('Loading existing recipe:', recipeId);
      this.currentRecipeId = recipeId;
      await this.loadRecipe(recipeId);
    }
  }

  // NEU: Lade Recipe aus Firestore
  async loadRecipe(recipeId: string) {
    try {
      const recipe = await this.recipeService.getRecipe(recipeId);
      
      if (recipe && recipe.ingredients) {
        this.listIngredients = recipe.ingredients.map(ing => ({
          ...ing,
          isEditing: false,
          isDropdownOpen: false,
          isDeleting: false
        }));
        console.log('Recipe loaded:', recipe);
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
    }
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

  onServingSizeInput(event: any) {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    this.selectedServingSize = value;
    this.servingSizeInvalid = false;
  }

  onEditAmountInput(event: any, index: number) {
    let value = event.target.value;
    value = value.replace(/[^0-9]/g, '');
    this.listIngredients[index].amount = value;
    this.listIngredients[index].isAmountInvalid = false;
    event.target.value = value;
  }

  selectSuggestion(suggestion: string) {
    this.ingredientInput = suggestion;
    this.showSuggestions = false;
  }

  get limitedSuggestions(): string[] {
    return this.suggestions.slice(0, 3);
  }

  closeSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  addIngredient() {
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
      this.selectedUnit = 'gram';
      this.servingSizeInvalid = false;
      this.showSuggestions = false;
    }
  }

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

  // GEÄNDERT: Update wenn Recipe schon existiert, sonst neu erstellen
  async saveAndContinue() {
    if (this.listIngredients.length === 0) {
      alert('Please add at least one ingredient!');
      return;
    }

    try {
      console.log('Saving ingredients:', this.listIngredients);
      
      let recipeId: string;
      
      // Wenn Recipe schon existiert, update, sonst neu erstellen
      if (this.currentRecipeId) {
        await this.recipeService.updateIngredients(
          this.currentRecipeId,
          this.listIngredients
        );
        recipeId = this.currentRecipeId;
        console.log('Ingredients updated for recipe:', recipeId);
      } else {
        recipeId = await this.recipeService.saveIngredients(
          this.listIngredients
        );
        this.currentRecipeId = recipeId;
        console.log('New recipe created with ID:', recipeId);
      }

      // Navigate zu Preferences
      this.router.navigate(['/perferences', recipeId]);
    } catch (error) {
      console.error('Error saving ingredients:', error);
      alert('Error saving ingredients. Please try again.');
    }
  }
}