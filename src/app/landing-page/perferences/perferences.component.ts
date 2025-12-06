import { Component } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';  // NEU

@Component({
  selector: 'app-perferences',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './perferences.component.html',
  styleUrl: './perferences.component.scss'
})
export class PerferencesComponent {
  portions: number = 2;
  persons: number = 1;  // KORRIGIERT: war "persomen"

  selectedCookingTime: string | null = null;
  selectedCuisine: string | null = null;
  selectedDiet: string | null = null;

  constructor(
    private router: Router, 
    private route: ActivatedRoute,
    private recipeService: RecipeService  // NEU
  ) {}

  selectCookingTime(time: string) {
    this.selectedCookingTime = time;
  }

  selectCuisine(cuisine: string) {
    this.selectedCuisine = cuisine;
  }

  selectDiet(diet: string) {
    this.selectedDiet = diet;
  }

  incrementPortions() {
    this.portions++;
  }

  decrementPortions() {
    if (this.portions > 1) {
      this.portions--;
    }
  } 

  incrementPersons() {
    this.persons++;
  }

  decrementPersons() {
    if (this.persons > 1) {
      this.persons--;
    }
  }

  goBack() {
    const recipeId = this.route.snapshot.params['id'];
    this.router.navigate(['/generate-recipe'], { 
      queryParams: { recipeId: recipeId } 
    });
  }

  async generateRecipe() {
    const recipeId = this.route.snapshot.params['id'];
    
    // Validierung
    if (!this.selectedCookingTime || !this.selectedCuisine || !this.selectedDiet) {
      alert('Please select all preferences!');
      return;
    }

    try {
      // 1. Speichere Preferences in Firestore
      await this.recipeService.savePreferences(recipeId, {
        portions: this.portions,
        persons: this.persons,
        cookingTime: this.selectedCookingTime,
        cuisine: this.selectedCuisine,
        diet: this.selectedDiet
      });

      console.log('Preferences saved!');

      // 2. Navigate zu Loading
      this.router.navigate(['/loading', recipeId]);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    }
  }
}