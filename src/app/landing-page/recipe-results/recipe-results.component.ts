import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';

interface RecipeCard {
  title: string;
  description: string;
  cookTime: string;
  difficulty: string;
  servings: number;
}

@Component({
  selector: 'app-recipe-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-results.component.html',
  styleUrl: './recipe-results.component.scss'
})
export class RecipeResultsComponent implements OnInit {
  recipes: RecipeCard[] = [];
  recipeId: string = '';
  cuisine: string = '';
  cookingTime: string = '';
  error: boolean = false;
  loading: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private recipeService: RecipeService
  ) {}

  async ngOnInit() {
    this.recipeId = this.route.snapshot.params['id'];

    try {
      console.log('Loading recipes:', this.recipeId);
      
      // Lade Recipe aus Firestore
      const fullRecipe = await this.recipeService.getRecipe(this.recipeId);
      
      console.log('Full recipe data:', fullRecipe);
      
      if (fullRecipe && fullRecipe.generatedRecipes && Array.isArray(fullRecipe.generatedRecipes)) {
        this.recipes = fullRecipe.generatedRecipes;
        
        // Get preferences for display
        if (fullRecipe.preferences) {
          this.cuisine = fullRecipe.preferences.cuisine;
          this.cookingTime = fullRecipe.preferences.cookingTime;
        }
        
        console.log('Recipes loaded:', this.recipes);
      } else {
        console.error('No generated recipes found');
        this.error = true;
      }
    } catch (error) {
      console.error('Error loading recipes:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  viewRecipe(index: number) {
  // Navigate to recipe-view
  this.router.navigate(['/recipe-view', this.recipeId, index]);
}

  generateNew() {
    this.router.navigate(['/generate-recipe']);
  }
}