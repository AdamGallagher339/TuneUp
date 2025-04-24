import { Injectable } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { map, from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: Firestore) {}

  getAllUsers() {
    const userCollection = collection(this.firestore, 'users');
    return from(getDocs(userCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }
}
