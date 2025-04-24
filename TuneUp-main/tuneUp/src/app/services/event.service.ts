import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class EventService {
  constructor(private firestore: Firestore) {}

  createEvent(eventData: any) {
    const eventsRef = collection(this.firestore, 'events');
    return addDoc(eventsRef, eventData);
  }
}