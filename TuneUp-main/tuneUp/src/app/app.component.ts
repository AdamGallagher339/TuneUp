import { Component } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseTestComponent } from './components/firestore-test/firestore-test.component'; 
import { CommonModule } from '@angular/common';


@Component({
  standalone: true,
  imports: [
    CommonModule   ,
    FirebaseTestComponent
  ],
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  testResults: any;
  
  constructor(private firestore: Firestore) {}

  async testConnection() {
    try {
      const docRef = doc(this.firestore, 'users/TUqTbPLHSM1aUo8NZr28');
      const docSnap = await getDoc(docRef);
      this.testResults = docSnap.exists() ? docSnap.data() : { error: 'No user found' };
    } catch (error) {
      this.testResults = { error };
    }
  }
}