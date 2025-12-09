import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { RecipeService } from '../../services/recipe.service';

interface LikedRecipe {
  id: string;
  title: string;
  cookingTime: string;
  likes: number;
}

@Component({
  selector: 'app-cookbook',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './cookbook.component.html',
  styleUrl: './cookbook.component.scss'
})
export class CookbookComponent implements OnInit {
  recipes: { img: string, title: string }[] = [
    { img: "card.png", title: "Italian cuisine 🍝" },
    { img: "card (1).png", title: "German cuisine 🥨" },
    { img: "card (2).png", title: "Japanese cuisine 🍱" },
    { img: "card (3).png", title: "Gourmet cuisine ✨" },
    { img: "card (4).png", title: "Indian cuisine 🍛" },
    { img: "card (5).png", title: "Fusion cuisine 🎨" }
  ];

  likedRecipes: LikedRecipe[] = [];
  currentSlideIndex = 0;

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private location: Location
  ) {}

  async ngOnInit() {
    await this.loadLikedRecipes();
  }

  async loadLikedRecipes() {
    // TODO: Load from Firebase
    // Mockdaten für jetzt:
    this.likedRecipes = [
      { id: 'p5Uk2wGERVMKAx0k8C35', title: 'Pasta with spinach and cherry tomatoes', cookingTime: '20min', likes: 66 },
      { id: 'WJMQ6TihR0fdepnm9eBh', title: 'Low Carb Vegan No-Bake Paleo Bars', cookingTime: '35min', likes: 57 },
      { id: 'abc123', title: 'Spaghetti Carbonara', cookingTime: '25min', likes: 45 },
      { id: 'def456', title: 'Pad Thai', cookingTime: '30min', likes: 52 }
    ];
  }

  goBack() {
    this.location.back();  // Geht zur vorherigen Seite zurück!
  }

  previousSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  nextSlide() {
    if (this.currentSlideIndex < this.likedRecipes.length - 2) {
      this.currentSlideIndex++;
    }
  }

  viewRecipe(recipeId: string) {
    this.router.navigate(['/recipe-view', recipeId, 0]);
  }

  browseCuisine(cuisine: string) {
    alert(`Browsing ${cuisine} - Feature coming soon!`);
  }
}
