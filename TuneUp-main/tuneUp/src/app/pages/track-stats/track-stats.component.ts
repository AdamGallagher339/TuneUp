import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-track-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './track-stats.component.html',
  styleUrls: ['./track-stats.component.less']
})
export class TrackStatsComponent {
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
        maxLean: 42
      };
    }
  }

  discardSession() {
    this.sessionStats = null;
  }

  saveSession() {
    if (!this.sessionStats) return;
    console.log('Saving session:', this.sessionStats);
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
    this.testStats = null;
    this.showTestPopup = false;
  }

  saveTest() {
    if (!this.testStats) {
      console.warn('No test data to save.');
      return;
    }

    this.savingTest = true;
    console.log('Saving test:', this.testStats);

    setTimeout(() => {
      this.savingTest = false;
      this.showTestPopup = false;
      this.testStats = null;
    }, 1500);
  }
}
