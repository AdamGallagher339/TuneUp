import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, collection, collectionData, deleteDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { FormatDurationPipe } from './format-duration.pipe'; 

@Component({
  selector: 'app-view-stats',
  standalone: true,
  imports: [CommonModule,FormatDurationPipe],
  templateUrl: './view-stats.component.html',
  styleUrls: ['./view-stats.component.less']
})
export class ViewStatsComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  
  sessions$!: Observable<any[]>;
  tests$!: Observable<any[]>;
  user: User | null = null;
  
  loading: boolean = true;
  
  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      this.loading = false;
      if (user) {
        this.user = user;
  
        const userDoc = doc(this.firestore, `users/${user.uid}`);
        const sessionsRef = collection(userDoc, 'sessions');
        const testsRef = collection(userDoc, 'tests');
  
        this.sessions$ = collectionData(sessionsRef, { idField: 'id' });
        this.tests$ = collectionData(testsRef, { idField: 'id' });
      } else {
        console.warn('User not logged in');
        this.sessions$ = of([]);
        this.tests$ = of([]);
      }
    });
  }
  
  public async deleteSession(sessionId: string) {
    if (!this.user) {
      return;
    }
    // Optionally, you can add a confirmation prompt:
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }
    try {
      const sessionDoc = doc(this.firestore, `users/${this.user.uid}/sessions`, sessionId);
      await deleteDoc(sessionDoc);
      // Optionally, you might display a success message or handle UI updates
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  }
}
