import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent implements OnInit {
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private http: HttpClient,
    private recipeService: RecipeService
  ) {}

  async ngOnInit() {
    const recipeId = this.route.snapshot.params['id'];
    
    if (!recipeId) {
      console.error('No recipe ID provided');
      alert('No recipe ID found!');
      return;
    }

    console.log('Starting recipe generation for ID:', recipeId);

    try {
      // Call n8n workflow mit nur der recipeId
      await this.generateRecipeFromAI(recipeId);
      
      // Navigate zu Results
      this.router.navigate(['/recipe-results', recipeId]);
    } catch (error) {
      console.error('Error during recipe generation:', error);
      alert('Error generating recipe. Please try again.');
    }
  }

  private async generateRecipeFromAI(recipeId: string): Promise<void> {
    try {
      console.log('Calling n8n workflow with recipeId:', recipeId);
      
      const response = await this.http.post<any>(
        'http://localhost:5678/webhook/generate-recipe',
        { recipeId: recipeId }  // NUR die recipeId schicken!
      ).toPromise();
      
      console.log('Recipe generated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error calling n8n workflow:', error);
      throw error;
    }
  }
}