import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isGenerateRecipePage = false;
  isPerferencesPage = false;
  isRecipeViewPage = false;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isGenerateRecipePage = this.router.url.includes('/generate-recipe');
      this.isPerferencesPage = this.router.url.includes('/perferences');
      this.isRecipeViewPage = this.router.url.includes('/recipe-view');
      
    });
  }
}
