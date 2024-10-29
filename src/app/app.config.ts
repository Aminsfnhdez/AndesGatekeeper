import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'andes-gatekeeper',
        appId: '1:601495050154:web:022502021dfbfe4cefbdd3',
        storageBucket: 'andes-gatekeeper.appspot.com',
        apiKey: 'AIzaSyC0E8NXKFgtO1WnVBAAlxnDg2xZBgHcQYo',
        authDomain: 'andes-gatekeeper.firebaseapp.com',
        messagingSenderId: '601495050154',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
