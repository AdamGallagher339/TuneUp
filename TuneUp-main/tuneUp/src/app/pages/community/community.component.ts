import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { collection, getDocs, query, orderBy, deleteDoc, doc ,setDoc} from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
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
    date: ''
  };

  constructor(
    private auth: AuthService,
    private userService: UserService,
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

  async deleteEvent(eventId: string) {
    try {
      await deleteDoc(doc(this.firestore, 'events', eventId));
      this.showToast('✅ Event deleted');
      this.loadEvents();
    } catch (err) {
      console.error('❌ Failed to delete event:', err);
      this.showToast('❌ Could not delete event');
    }
  }

  viewProfile(userId: string) {
    this.router.navigate(['/profile', userId]);
  }

  showToast(message: string) {
    this.toastText = message;
    setTimeout(() => this.toastText = '', 2500);
  }

  public async createRideEvent() {
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
      timestamp: new Date()
    };

    try {
      await setDoc(eventDoc, newEvent);
      this.showToast('✅ Event created');
      this.creatingEvent = false;
      this.event = { title: '', description: '', location: '', date: '' };
      this.loadEvents();
    } catch (err) {
      console.error('❌ Event creation error:', err);
      this.showToast('❌ Failed to create event');
    }
  }
}
