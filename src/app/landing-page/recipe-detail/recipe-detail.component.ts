import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail.component.html',
  styleUrl: './recipe-detail.component.scss'
})
export class RecipeDetailComponent implements OnInit {
  recipe: any = null;
  recipeId: string = '';
  recipeIndex: number = 0;
  loading = true;
  error = false;
  cuisineId: string = '';

  // ← NEU: Ingredients Arrays hinzufügen
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
    this.cuisineId = this.route.snapshot.queryParams['cuisine'] || '';

    try {
      const fullRecipe = await this.recipeService.getRecipe(this.recipeId);
      
      if (fullRecipe?.generatedRecipes?.[this.recipeIndex]) {
        this.recipe = fullRecipe.generatedRecipes[this.recipeIndex];
        
        // ← NEU: Ingredients aufteilen (falls vorhanden)
        if (fullRecipe.ingredients && this.recipe?.ingredients) {
          const userIngNames = fullRecipe.ingredients.map(ing => ing.name.toLowerCase());
          
          this.userIngredients = this.recipe.ingredients.filter((ing: any) => {
            return userIngNames.some(userName => 
              ing.toLowerCase().includes(userName)
            );
          });
          
          this.extraIngredients = this.recipe.ingredients.filter((ing: any) => {
            return !userIngNames.some(userName => 
              ing.toLowerCase().includes(userName)
            );
          });
        } else {
          // Wenn keine User-Ingredients vorhanden, zeige alle als extra
          this.userIngredients = [];
          this.extraIngredients = this.recipe?.ingredients || [];
        }
      } else {
        console.error('Recipe not found:', this.recipeId, this.recipeIndex);
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
    if (this.cuisineId) {
      this.router.navigate(['/recipes'], { queryParams: { category: this.cuisineId } });
    } else {
      this.router.navigate(['/cookbook']);
    }
  }

  generateNewRecipe() {
    this.router.navigate(['/generate-recipe']);
  }

  giveHeart() {
    alert('❤️ Recipe loved!');
  }

  goToCookbook() {
    this.router.navigate(['/cookbook']);
  }

  getStepTitle(instruction: string): string {
    const words = instruction.split(' ');
    if (words.length > 3) {
      return words.slice(0, 3).join(' ') + '...';
    }
    return instruction.substring(0, 30) + '...';
  }

  getChefImage(index: number): string {
    return index % 2 === 0 
      ? '../../../assets/img/Untitled design 2.png' 
      : '../../../assets/img/Untitled design (3) 1.png';
  }
}