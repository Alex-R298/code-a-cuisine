import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';

export interface Ingredient {
  name: string;
  nameLower: string;
}

@Injectable({
  providedIn: 'root'
})
export class IngredientsService {
  private allIngredients: string[] = [];
  private isLoaded = false;

  constructor(private firestore: Firestore) {}

  /**
   * Load all ingredients from Firebase (call once at app start)
   */
  async loadIngredients(): Promise<void> {
    if (this.isLoaded) {
      console.log('Ingredients already loaded');
      return;
    }

    try {
      console.log('Loading ingredients from Firebase...');
      const ingredientsCollection = collection(this.firestore, 'ingredients');
      const snapshot = await getDocs(ingredientsCollection);
      
      this.allIngredients = snapshot.docs
        .map(doc => doc.data()['name'] as string)
        .sort(); // Alphabetisch sortieren

      this.isLoaded = true;
      console.log(`✅ Loaded ${this.allIngredients.length} ingredients`);
    } catch (error) {
      console.error('❌ Error loading ingredients:', error);
      throw error;
    }
  }

  /**
   * Search ingredients locally (no API calls!)
   */
  searchIngredients(searchTerm: string): string[] {
    if (!searchTerm || searchTerm.length === 0) {
      return [];
    }

    const lowerSearch = searchTerm.toLowerCase();
    
    // Filter alle Zutaten die mit dem Suchbegriff starten
    return this.allIngredients
      .filter(ingredient => 
        ingredient.toLowerCase().startsWith(lowerSearch)
      )
      .slice(0, 10); // Max 10 Suggestions
  }

  /**
   * Get the first matching ingredient for inline autocomplete
   */
  getFirstMatch(searchTerm: string): string | null {
    if (!searchTerm || searchTerm.length === 0) {
      return null;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const match = this.allIngredients.find(ingredient => 
      ingredient.toLowerCase().startsWith(lowerSearch)
    );

    return match || null;
  }

  /**
   * Check if ingredients are loaded
   */
  isIngredientsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get all ingredients (for debugging)
   */
  getAllIngredients(): string[] {
    return [...this.allIngredients];
  }
}