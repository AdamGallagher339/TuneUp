import { Injectable } from '@angular/core';
import { collection, addDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FriendService {
  constructor(private firestore: Firestore) {}

  sendRequest(fromUserId: string, toUserId: string) {
    const friendRequestsRef = collection(this.firestore, 'friendRequests');
    return addDoc(friendRequestsRef, {
      from: fromUserId,
      to: toUserId,
      status: 'pending',
      timestamp: new Date()
    });
  }
}
