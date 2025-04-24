import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

@Component({
  selector: 'app-track-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-stats.component.html',
  styleUrls: ['./track-stats.component.less']
})
export class TrackStatsComponent {
  private db = getFirestore();

  isTracking = false;
  showTestPopup = false;
  testActive = false;
  savingTest = false;

  timer = 0;
  currentSpeed = 0; // ← Bind to live GPS/sensor
  currentLean = 0;
  currentGForce = 0;

  sessionStats: any = null;

  testStats: {
    accelerationTime: number | null;
    brakingTime: number | null;
  } | null = null;

  hit100 = false;
  private testStart = 0;
  private accelerationEnd = 0;

  toggleTracking() {
    this.isTracking = !this.isTracking;
    if (!this.isTracking) {
      this.sessionStats = {
        elapsed: this.timer,
        topSpeed: 121,
        averageSpeed: 87,
        maxLean: 42,
        endTime: new Date()
      };
    }
  }

  discardSession() {
    this.sessionStats = null;
  }

  public async saveSession() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.sessionStats) return;

    // Save session data to: users/{user.uid}/sessions/{timestamp}
    const sessionDoc = doc(this.db, `users/${user.uid}/sessions`, Date.now().toString());
    try {
      await setDoc(sessionDoc, {
        ...this.sessionStats,
        endTime: this.sessionStats.endTime || new Date(),
      });
      console.log('Session data saved successfully!');
      this.resetSession();
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  startTestPopup() {
    this.showTestPopup = true;
    this.testActive = true;
    this.testStats = null;
    this.testStart = performance.now();
    this.accelerationEnd = 0;
    this.hit100 = false;

    this.monitorSpeedForTest();
  }

  monitorSpeedForTest() {
    const interval = setInterval(() => {
      if (!this.testActive) {
        clearInterval(interval);
        return;
      }

      const speed = this.currentSpeed;

      if (!this.hit100 && speed >= 100) {
        this.hit100 = true;
        this.accelerationEnd = performance.now();
        console.log('✅ Reached 100 km/h');
      }
    }, 200);
  }

  endTest() {
    if (!this.testActive) return;

    this.testActive = false;
    const now = performance.now();

    let accelerationTime: number | null = null;
    let brakingTime: number | null = null;

    if (this.hit100 && this.accelerationEnd > 0) {
      accelerationTime = (this.accelerationEnd - this.testStart) / 1000;
      brakingTime = (now - this.accelerationEnd) / 1000;
    } else {
      accelerationTime = (now - this.testStart) / 1000;
    }

    this.testStats = {
      accelerationTime: parseFloat(accelerationTime.toFixed(2)),
      brakingTime: brakingTime ? parseFloat(brakingTime.toFixed(2)) : null
    };

    console.log('🏁 Test ended:', this.testStats);
  }

  discardTest() {
    this.resetTest();
  }

  public async saveTest() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.testStats) {
      console.warn('No test data to save or user not authenticated.');
      return;
    }

    const testDoc = doc(this.db, `users/${user.uid}/tests`, Date.now().toString());
    try {
      await setDoc(testDoc, { ...this.testStats });
      console.log('Test data saved successfully!');
      this.resetTest();
    } catch (error) {
      console.error('Error saving test data:', error);
    }
  }

  private resetSession() {
    this.sessionStats = null;
    this.timer = 0;
    this.isTracking = false;
  }

  private resetTest() {
    this.testStats = null;
    this.showTestPopup = false;
    this.testActive = false;
    this.hit100 = false;
  }
}
