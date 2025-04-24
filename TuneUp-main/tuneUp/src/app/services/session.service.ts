// session.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  constructor(private firestore: Firestore) { }

  getUserSessions(uid: string) {
    const sessionsCollection = collection(this.firestore, `users/${uid}/sessions`);
    return from(getDocs(sessionsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }
}
