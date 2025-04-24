import { Component } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
// import { FirebaseTestComponent } from './components/firestore-test/firestore-test.component'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  testResults: any;

  constructor(
    public router: Router,
    private firestore: Firestore
  ) {}

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
