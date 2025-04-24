import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';

import { environment } from './environments/environment';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => {
      try {
        return initializeApp(environment.firebaseConfig);
      } catch (error) {
        console.error('Firebase initialization error:', error);
        throw new Error('Invalid Firebase configuration'); // Proper error message
      }
    }),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth())
  ]
});
