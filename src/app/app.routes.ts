import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { GenerateRecipeComponent } from './landing-page/generate-recipe/generate-recipe.component';
import { PerferencesComponent } from './landing-page/perferences/perferences.component';
import { LoadingComponent } from './landing-page/loading/loading.component';  // NEU
import { RecipeResultsComponent } from './landing-page/recipe-results/recipe-results.component';

export const routes: Routes = [
    { path: '', component: LandingPageComponent }, 
    { path: 'generate-recipe', component: GenerateRecipeComponent }, 
    { path: 'perferences/:id', component: PerferencesComponent },
     { path: 'loading/:id', component: LoadingComponent },  // NEU
  { path: 'recipe-results/:id', component: RecipeResultsComponent }   // GEÄNDERT: mit :id Parameter
];
