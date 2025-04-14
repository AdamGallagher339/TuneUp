import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { sensorService } from './services/sensor.service'; // Fixed casing
import { FirebaseTestComponent } from './components/firestore-test/firestore-test.component';
import { CommonModule } from '@angular/common';
import { query, orderBy, limit } from 'firebase/firestore'; // Add Firestore imports

@NgModule({
  declarations: [
    AppComponent,
    FirebaseTestComponent 
  ],
  imports: [
    CommonModule,
    BrowserModule, // Add missing comma
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore())
  ],
  providers: [sensorService], // Capital S
  bootstrap: [AppComponent]
})
export class AppModule {}