import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, getDoc } from '@angular/fire/firestore';

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
}

export interface RecipePreferences {
  portions: number;
  persons: number;
  cookingTime: string;
  cuisine: string;
  diet: string;
}

export interface Recipe {
  id?: string;
  ingredients: Ingredient[];
  preferences?: RecipePreferences;
  generatedRecipes?: any[];  // Array of 3 recipes!
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private currentRecipeId: string | null = null;

  constructor(private firestore: Firestore) {}

async saveIngredients(ingredients: Ingredient[]): Promise<string> {
  try {
    const recipeData = {
      ingredients: ingredients,
      createdAt: new Date()
      // ENTFERNT: preferences und generatedRecipe
    };

    const docRef = await addDoc(
      collection(this.firestore, 'recipes'),
      recipeData
    );

    this.currentRecipeId = docRef.id;
    console.log('Recipe created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving ingredients:', error);
    throw error;
  }
}

  // Step 2: Update mit Preferences (kommt später)
  async savePreferences(recipeId: string, preferences: RecipePreferences): Promise<void> {
    try {
      const recipeRef = doc(this.firestore, 'recipes', recipeId);
      await updateDoc(recipeRef, {
        preferences: preferences
      });
      console.log('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  // Hilfsmethode: Recipe by ID holen
  async getRecipe(recipeId: string): Promise<Recipe | null> {
    try {
      const recipeRef = doc(this.firestore, 'recipes', recipeId);
      const recipeSnap = await getDoc(recipeRef);

      if (recipeSnap.exists()) {
        return {
          id: recipeSnap.id,
          ...recipeSnap.data()
        } as Recipe;
      }
      return null;
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  }

  // Getter für aktuelle Recipe ID
  getCurrentRecipeId(): string | null {
    return this.currentRecipeId;
  }

  // In recipe.service.ts
async updateIngredients(recipeId: string, ingredients: Ingredient[]): Promise<void> {
  try {
    const recipeRef = doc(this.firestore, 'recipes', recipeId);
    await updateDoc(recipeRef, {
      ingredients: ingredients
    });
    console.log('Ingredients updated');
  } catch (error) {
    console.error('Error updating ingredients:', error);
    throw error;
  }
}
}
