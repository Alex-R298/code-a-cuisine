import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  selectedCategoryId: string = '';
  selectedCategory: {id: string, img: string, title: string, firebaseValue: string} | undefined;
  allRecipes: any[] = [];
  filteredRecipes: any[] = [];
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;

  categories: {id: string, img: string, title: string, firebaseValue: string}[] = [
    { id: "italian", img: "header-4.png", title: "Italian cuisine", firebaseValue: "Italian" },
    { id: "german", img: "header-6.png", title: "German cuisine", firebaseValue: "German" },
    { id: "japanese", img: "header-5.png", title: "Japanese cuisine", firebaseValue: "Japanese" },
    { id: "gourmet", img: "header-1.png", title: "Gourmet cuisine", firebaseValue: "Gourmet" },
    { id: "indian", img: "header-2.png", title: "Indian cuisine", firebaseValue: "Indian" },
    { id: "fusion", img: "header-7.png", title: "Fusion cuisine", firebaseValue: "Fusion" }
  ];

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'];
      this.selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId);
      
      if (this.selectedCategory) {
        this.loadRecipesByCategory(this.selectedCategory.firebaseValue);
      }
    });
  }

  loadRecipesByCategory(cuisineValue: string) {
  const recipesRef = collection(this.firestore, 'recipes');
  const q = query(recipesRef, where('preferences.cuisine', '==', cuisineValue));
  
  collectionData(q, { idField: 'id' }).subscribe(documents => {
    this.allRecipes = [];
    let globalIndex = 0;
    
    documents.forEach((doc: any) => {
      if (doc.generatedRecipes && Array.isArray(doc.generatedRecipes)) {
        doc.generatedRecipes.forEach((recipe: any, localIndex: number) => {
          this.allRecipes.push({
            id: `${doc.id}_${localIndex}`,
            title: recipe.title,
            cookingTime: recipe.totalTime || recipe.cookTime || 'N/A',
            cookingTimePreference: doc.preferences?.cookingTime, // ← NEU: "Quick", "Medium", etc.
            likes: 0,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            difficulty: recipe.difficulty,
            servings: recipe.servings,
            parentDocId: doc.id,
            recipeIndex: globalIndex,
            localRecipeIndex: localIndex
          });
          globalIndex++;
        });
      }
    });
    
    this.totalPages = Math.ceil(this.allRecipes.length / this.itemsPerPage);
    this.updateDisplayedRecipes();
  });
}


  updateDisplayedRecipes() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredRecipes = this.allRecipes.slice(startIndex, endIndex);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedRecipes();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (this.totalPages <= maxPagesToShow) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push(-1); // Platzhalter für "..."
        pages.push(this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1);
        pages.push(-1);
        for (let i = this.totalPages - 2; i <= this.totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        pages.push(this.currentPage);
        pages.push(-1);
        pages.push(this.totalPages);
      }
    }
    
    return pages;
  }

 viewRecipe(parentDocId: string, recipe: any, event?: MouseEvent) {
  this.router.navigate(['/recipe-detail', parentDocId, recipe.localRecipeIndex], {
    queryParams: { cuisine: this.selectedCategoryId } // Übergebe die Cuisine für den Back-Button
  });
}
}