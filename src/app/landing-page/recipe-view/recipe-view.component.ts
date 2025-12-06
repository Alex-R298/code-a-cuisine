import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';

interface DetailedRecipe {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  totalTime?: string;
  servings: number;
  difficulty: string;
  ingredients: string[];
  instructions: string[];
  tips?: string[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
}

@Component({
  selector: 'app-recipe-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-view.component.html',
  styleUrl: './recipe-view.component.scss'
})
export class RecipeViewComponent implements OnInit {
  recipe: DetailedRecipe | null = null;
  recipeId: string = '';
  recipeIndex: number = 0;
  loading = true;
  error = false;

  // Split ingredients
  userIngredients: string[] = [];
  extraIngredients: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  async ngOnInit() {
    this.recipeId = this.route.snapshot.params['recipeId'];
    this.recipeIndex = parseInt(this.route.snapshot.params['index']);

    try {
      const fullRecipe = await this.recipeService.getRecipe(this.recipeId);
      
      if (fullRecipe && fullRecipe.generatedRecipes && fullRecipe.generatedRecipes[this.recipeIndex]) {
        this.recipe = fullRecipe.generatedRecipes[this.recipeIndex];
        
        // Split ingredients
        if (fullRecipe.ingredients && this.recipe && this.recipe.ingredients) {
          const userIngNames = fullRecipe.ingredients.map(ing => ing.name.toLowerCase());
          
          this.userIngredients = this.recipe.ingredients.filter(ing => {
            return userIngNames.some(userName => 
              ing.toLowerCase().includes(userName)
            );
          });
          
          this.extraIngredients = this.recipe.ingredients.filter(ing => {
            return !userIngNames.some(userName => 
              ing.toLowerCase().includes(userName)
            );
          });
        }
      } else {
        this.error = true;
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/recipe-results', this.recipeId]);
  }

  giveHeart() {
    alert('❤️ Recipe loved!');
  }

  goToCookbook() {
    this.router.navigate(['/']);
  }

  getStepTitle(instruction: string): string {
  // Extract first few words as title
  const words = instruction.split(' ');
  if (words.length > 3) {
    return words.slice(0, 3).join(' ') + '...';
  }
  return instruction.substring(0, 30) + '...';
}
}
