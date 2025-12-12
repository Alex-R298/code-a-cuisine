import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recipes.component.html',
  styleUrl: './recipes.component.scss'
})
export class RecipesComponent implements OnInit {
  selectedCategoryId: string = '';
  selectedCategory: {id: string, img: string, title: string} | undefined;

  categories: {id: string, img: string, title: string}[] = [
    { id: "italian", img: "header-4.png", title: "Italian cuisine" },
    { id: "german", img: "header-6.png", title: "German cuisine" },
    { id: "japanese", img: "header-5.png", title: "Japanese cuisine" },
    { id: "gourmet", img: "header-1.png", title: "Gourmet cuisine" },
    { id: "indian", img: "header-2.png", title: "Indian cuisine" },
    { id: "fusion", img: "header-7.png", title: "Fusion cuisine" }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.selectedCategoryId = params['category'];
      // Finde die passende Kategorie anhand der ID
      this.selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId);
    });
  }
}