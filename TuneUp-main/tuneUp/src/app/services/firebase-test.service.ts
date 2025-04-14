//this page is dedicated to testing the firebase connection and the firestore database
import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc,addDoc,collection } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseTestService {
  constructor(private firestore: Firestore) {}

    // Unified save method for telemetry
    async saveTelemetry(data: any) {
      const telemetryRef = collection(this.firestore, 'telemetry');
      return addDoc(telemetryRef, {
        ...data,
        timestamp: new Date()
      });
    }

  // Add/Update a user
  async testAddUser() {
    const userData = {
      username: 'motorbike_rider',
      password: 'safeRider123', 
      bikeType: 'sport',
      safetyScore: 85,
      lastRide: new Date()
    };

    try {
    
      const userRef = doc(this.firestore, 'users/TUqTbPLHSM1aUo8NZr28');
      await setDoc(userRef, userData);
      console.log('User added/updated successfully!');
      return true;
    } catch (e) {
      console.error('Error adding user:', e);
      return false;
    }
  }

  // Get a user
  async testGetUser() {
    try {
      const userRef = doc(this.firestore, 'users/TUqTbPLHSM1aUo8NZr28');
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        console.log('User data:', docSnap.data());
        return docSnap.data();
      } else {
        console.log('No such user!');
        return null;
      }
    } catch (e) {
      console.error('Error getting user:', e);
      return null;
    }
  }


  
}