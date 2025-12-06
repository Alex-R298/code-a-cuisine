import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

const firebaseConfig = {
  projectId: "code-a-cuisine-d3a5a",
  appId: "1:883375551936:web:aee7299c1588b3046c4425",
  storageBucket: "code-a-cuisine-d3a5a.firebasestorage.app",
  apiKey: "AIzaSyBiL-LFaL52hO7dVUeoz0aScOCIniF9KsM",
  authDomain: "code-a-cuisine-d3a5a.firebaseapp.com",
  messagingSenderId: "883375551936"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    
    // Firebase
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore())
  ]
};