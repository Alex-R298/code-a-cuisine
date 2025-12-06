import { Component } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {

  // In loading.component.ts

// async ngOnInit() {
//   const recipeId = this.route.snapshot.params['id'];
  
//   // 3. Rufe n8n Workflow auf
//   await this.generateRecipeFromAI(recipeId);
  
//   // 4. Navigate zu Results
//   this.router.navigate(['/recipe-results', recipeId]);
// }

}
