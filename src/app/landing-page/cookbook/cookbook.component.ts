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
  recipes: { id: string, img: string, title: string, imgIcon: string }[] = [
  { id: "italian", img: "card.png", title: "Italian cuisine", imgIcon: "Italian-icon.png" },
  { id: "german", img: "card (1).png", title: "German cuisine", imgIcon: "German-icon.png" },
  { id: "japanese", img: "card (2).png", title: "Japanese cuisine", imgIcon: "Japanese-icon.png" },
  { id: "gourmet", img: "card (3).png", title: "Gourmet cuisine", imgIcon: "Gourmet-icon.png" },
  { id: "indian", img: "card (4).png", title: "Indian cuisine", imgIcon: "Indian-icon.png" },
  { id: "fusion", img: "card (5).png", title: "Fusion cuisine", imgIcon: "Fusion-icon.png" }
];

  likedRecipes: LikedRecipe[] = [];
  currentSlideIndex = 0;

  // Drag-State
  private isDragging = false;
  private startX = 0;
  private currentTranslate = 0;
  private prevTranslate = 0;
  private hasDragged = false; // NEU!

  constructor(
    private router: Router,
    private recipeService: RecipeService,
    private location: Location
  ) {}

  async ngOnInit() {
    await this.loadLikedRecipes();
  }

  async loadLikedRecipes() {
    this.likedRecipes = [
      { id: 'p5Uk2wGERVMKAx0k8C35', title: 'Pasta with spinach and cherry tomatoes', cookingTime: '20min', likes: 66 },
      { id: 'WJMQ6TihR0fdepnm9eBh', title: 'Low Carb Vegan No-Bake Paleo Bars', cookingTime: '35min', likes: 57 },
      { id: 'abc123', title: 'Spaghetti Carbonara', cookingTime: '25min', likes: 45 },
      { id: 'def456', title: 'Pad Thai', cookingTime: '30min', likes: 52 }
    ];
  }

  onDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.hasDragged = false; // Reset
    this.startX = event.clientX;
    this.prevTranslate = this.currentSlideIndex * -50;
  }

  onDragMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const currentX = event.clientX;
    const diff = currentX - this.startX;
    
    // Wenn mehr als 5px bewegt wurde, gilt es als Drag
    if (Math.abs(diff) > 5) {
      this.hasDragged = true;
    }
    
    const percentageMoved = (diff / 400) * 100;
    this.currentTranslate = this.prevTranslate + percentageMoved;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    
    const movedBy = this.currentTranslate - this.prevTranslate;
    
    if (movedBy < -5 && this.currentSlideIndex < this.likedRecipes.length - 2) {
      this.currentSlideIndex++;
    } else if (movedBy > 5 && this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
    
    this.currentTranslate = this.currentSlideIndex * -50;
    this.prevTranslate = this.currentTranslate;
  }

  getTransform(): string {
    if (this.isDragging) {
      return `translateX(${this.currentTranslate}%)`;
    }
    return `translateX(-${this.currentSlideIndex * 50}%)`;
  }

  viewRecipe(recipeId: string, event?: MouseEvent) {
    // Wenn gedragged wurde, Click ignorieren!
    if (this.hasDragged) {
      event?.preventDefault();
      return;
    }
    this.router.navigate(['/recipe-view', recipeId, 0]);
  }

  goBack() {
    this.location.back();
  }

  browseCuisine(cuisineId: string) {
  this.router.navigate(['/recipes'], { queryParams: { category: cuisineId } });
}
}