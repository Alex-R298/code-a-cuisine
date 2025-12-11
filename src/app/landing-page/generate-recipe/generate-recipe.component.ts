import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { IngredientsService } from '../../services/ingredients.service';

@Component({
  selector: 'app-generate-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [RecipeService, IngredientsService],
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
  currentRecipeId: string | null = null;

  ingredientInput = '';
  suggestions: string[] = [];
  showSuggestions = false;
  inlineCompletion = ''; // NEU: Für den grauen Text
  selectedSuggestionIndex = -1; // NEU: Für Arrow Navigation
  
  private searchSubject = new Subject<string>();
  isLoadingIngredients = true; // NEU: Loading state

  getDisplayUnit(unit: string): string {
    switch(unit) {
      case 'gram': return 'g';
      case 'ml': return 'ml';
      case 'piece': return '';
      default: return unit;
    }
  }

  constructor(
    private recipeService: RecipeService,
    private ingredientsService: IngredientsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Debounced search (300ms statt 400ms für schnellere Response)
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(value => {
      this.performLocalSearch(value);
    });
  }

  async ngOnInit() {
    // Lade Ingredients aus Firebase (EINMAL!)
    try {
      await this.ingredientsService.loadIngredients();
      this.isLoadingIngredients = false;
      console.log('✅ Ingredients ready for autocomplete');
    } catch (error) {
      console.error('Failed to load ingredients:', error);
      this.isLoadingIngredients = false;
    }

    // Check ob wir eine Recipe ID haben
    const recipeId = this.route.snapshot.queryParams['recipeId'];
    
    if (recipeId) {
      console.log('Loading existing recipe:', recipeId);
      this.currentRecipeId = recipeId;
      await this.loadRecipe(recipeId);
    }
  }

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

  // NEU: Lokale Suche ohne API Calls!
  performLocalSearch(value: string) {
    if (!value || value.length === 0) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.inlineCompletion = '';
      this.selectedSuggestionIndex = -1;
      return;
    }

    // Suche Suggestions
    this.suggestions = this.ingredientsService.searchIngredients(value);
    this.showSuggestions = this.suggestions.length > 0;
    this.selectedSuggestionIndex = -1; // Reset bei neuer Suche

    // Hole erste Match für Inline-Completion (grauer Text)
    const firstMatch = this.ingredientsService.getFirstMatch(value);
    
    if (firstMatch && firstMatch.toLowerCase().startsWith(value.toLowerCase())) {
      // Zeige nur den fehlenden Teil
      this.inlineCompletion = firstMatch.substring(value.length);
    } else {
      this.inlineCompletion = '';
    }

    console.log('Search:', value, '| Suggestions:', this.suggestions.length, '| Inline:', this.inlineCompletion);
  }

  onIngredientInput(event: any) {
    const value = event.target.value;
    this.ingredientInput = value;
    this.searchSubject.next(value);
  }

  // NEU: Handle Tab/Enter/Arrow keys für Navigation
  onIngredientKeyDown(event: KeyboardEvent) {
    // Arrow Down - Navigate nach unten
    if (event.key === 'ArrowDown' && this.showSuggestions) {
      event.preventDefault();
      this.selectedSuggestionIndex = 
        (this.selectedSuggestionIndex + 1) % this.suggestions.length;
      this.updateInlineFromSelection();
      return;
    }
    
    // Arrow Up - Navigate nach oben
    if (event.key === 'ArrowUp' && this.showSuggestions) {
      event.preventDefault();
      this.selectedSuggestionIndex = 
        this.selectedSuggestionIndex <= 0 
          ? this.suggestions.length - 1 
          : this.selectedSuggestionIndex - 1;
      this.updateInlineFromSelection();
      return;
    }
    
    // Tab oder Pfeil rechts → Übernimm Inline-Completion
    if ((event.key === 'Tab' || event.key === 'ArrowRight') && this.inlineCompletion) {
      event.preventDefault();
      
      // Wenn etwas selektiert ist, nimm das
      if (this.selectedSuggestionIndex >= 0) {
        this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
      } else {
        // Sonst nimm den inline completion
        this.ingredientInput = this.ingredientInput + this.inlineCompletion;
        this.inlineCompletion = '';
        this.showSuggestions = false;
      }
      return;
    }
    
    // Enter → Wähle selektierte oder erste Suggestion
    if (event.key === 'Enter' && this.suggestions.length > 0) {
      event.preventDefault();
      
      if (this.selectedSuggestionIndex >= 0) {
        this.selectSuggestion(this.suggestions[this.selectedSuggestionIndex]);
      } else {
        this.selectSuggestion(this.suggestions[0]);
      }
      return;
    }

    // Escape → Schließe Suggestions
    if (event.key === 'Escape') {
      this.showSuggestions = false;
      this.inlineCompletion = '';
      this.selectedSuggestionIndex = -1;
    }
  }

  // NEU: Update Inline Completion basierend auf Selektion
  updateInlineFromSelection() {
    if (this.selectedSuggestionIndex >= 0 && this.selectedSuggestionIndex < this.suggestions.length) {
      const selected = this.suggestions[this.selectedSuggestionIndex];
      if (selected.toLowerCase().startsWith(this.ingredientInput.toLowerCase())) {
        this.inlineCompletion = selected.substring(this.ingredientInput.length);
      }
    }
  }

  selectSuggestion(suggestion: string) {
    this.ingredientInput = suggestion;
    this.showSuggestions = false;
    this.inlineCompletion = '';
    this.selectedSuggestionIndex = -1;
  }

  get limitedSuggestions(): string[] {
    return this.suggestions.slice(0, 3); // Top 5 statt 3
  }

  closeSuggestions() {
    setTimeout(() => {
      this.showSuggestions = false;
      this.inlineCompletion = '';
      this.selectedSuggestionIndex = -1;
    }, 200);
  }

  // Rest bleibt gleich...
  
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectUnit(unit: string) {
    this.selectedUnit = unit;
    this.isDropdownOpen = false;
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
      this.inlineCompletion = '';
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

  async saveAndContinue() {
    if (this.listIngredients.length === 0) {
      alert('Please add at least one ingredient!');
      return;
    }

    try {
      console.log('Saving ingredients:', this.listIngredients);
      
      let recipeId: string;
      
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

      this.router.navigate(['/perferences', recipeId]);
    } catch (error) {
      console.error('Error saving ingredients:', error);
      alert('Error saving ingredients. Please try again.');
    }
  }
}