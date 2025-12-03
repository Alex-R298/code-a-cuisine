import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { GenerateRecipeComponent } from './landing-page/generate-recipe/generate-recipe.component';

export const routes: Routes = [
    {path: '', component: LandingPageComponent}, 
    {path: 'generate-recipe', component: GenerateRecipeComponent}, 
];
