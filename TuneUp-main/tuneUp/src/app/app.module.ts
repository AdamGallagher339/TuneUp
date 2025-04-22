import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { LoginComponent } from './login/login.component'; // Adjust the path if needed

import { AppComponent } from './app.component';
import { sensorService } from './services/sensor.service'; // Fixed casing
import { FirebaseTestComponent } from './components/firestore-test/firestore-test.component';
import { CommonModule } from '@angular/common';
import { query, orderBy, limit } from 'firebase/firestore'; // Add Firestore imports
import { FormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [
    AppComponent,
    FirebaseTestComponent ,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AppRoutingModule
  ],
  providers: [sensorService], // Capital S
  bootstrap: [AppComponent]
})
export class AppModule {}