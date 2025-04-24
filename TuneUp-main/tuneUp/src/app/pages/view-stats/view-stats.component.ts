import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, collection, collectionData } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-view-stats',
  standalone: true,
  imports: [CommonModule],
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
}
