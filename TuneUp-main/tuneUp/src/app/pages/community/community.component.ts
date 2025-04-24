import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FriendService } from '../../services/friend.service';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.less']
})
export class CommunityComponent implements OnInit {
  users: any[] = [];
  currentUserId: string = '';
  toastText = '';
  creatingEvent = false;
  events: any[] = [];

  event = {
    title: '',
    description: '',
    location: '',
    date: '',
    invitedFriends: []
  };

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private friendService: FriendService,
    private eventService: EventService,
    private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.currentUser?.uid || '';

    this.userService.getAllUsers().subscribe(users => {
      this.users = users.filter(u => u.id !== this.currentUserId);
    });

    this.loadEvents();
  }

  loadEvents() {
    const eventsRef = collection(this.firestore, 'events');
    const eventsQuery = query(eventsRef, orderBy('timestamp', 'desc'));
    getDocs(eventsQuery).then(snapshot => {
      this.events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  }

  showToast(message: string) {
    this.toastText = message;
    setTimeout(() => this.toastText = '', 2500);
  }

  async createRideEvent() {
    if (!this.event.title || !this.event.date || !this.event.location) {
      this.showToast('Please fill all event fields');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      this.showToast('You must be logged in to create events');
      return;
    }

    const eventDoc = doc(this.firestore, 'events', Date.now().toString());
    const newEvent = {
      ...this.event,
      createdBy: user.uid,
      timestamp: new Date(),
      attendees: [user.uid]  // Start with 1 attendee
    };

    try {
      await setDoc(eventDoc, newEvent);
      this.showToast('✅ Event created');
      this.creatingEvent = false;
      this.event = { title: '', description: '', location: '', date: '', invitedFriends: [] };
      this.loadEvents();
    } catch (err) {
      console.error('❌ Event creation error:', err);
      this.showToast('❌ Failed to create event');
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const docRef = doc(this.firestore, `events/${eventId}`);
      await deleteDoc(docRef);
      this.showToast('🗑️ Event deleted');
      this.loadEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      this.showToast('❌ Failed to delete event');
    }
  }
  hasJoined(event: any): boolean {
    return event.attendees?.includes(this.currentUserId);
  }

  async joinRide(event: any) {
    if (!event.attendees) {
      event.attendees = [];
    }
  
    if (!event.attendees.includes(this.currentUserId)) {
      event.attendees.push(this.currentUserId);
  
      try {
        const eventRef = doc(this.firestore, `events/${event.id}`);
        await setDoc(eventRef, event, { merge: true });
        this.showToast('✅ Joined the ride');
      } catch (error) {
        console.error('Failed to join ride:', error);
        this.showToast('❌ Failed to join ride');
      }
  
      this.loadEvents(); // Refresh the event list
    } else {
      this.showToast('❗ You have already joined this ride');
    }
  }

  async rsvpToEvent(event: any) {
    if (event.attendees && event.attendees.includes(this.currentUserId)) {
      this.showToast('⚠️ Already joined this ride');
      return;
    }

    

    const updatedAttendees = event.attendees ? [...event.attendees, this.currentUserId] : [this.currentUserId];
    try {
      const eventRef = doc(this.firestore, `events/${event.id}`);
      await updateDoc(eventRef, { attendees: updatedAttendees });
      this.showToast('✅ Joined the ride');
      this.loadEvents();
    } catch (err) {
      console.error('Failed to RSVP:', err);
      this.showToast('❌ Failed to RSVP');
    }
  }

 
}
