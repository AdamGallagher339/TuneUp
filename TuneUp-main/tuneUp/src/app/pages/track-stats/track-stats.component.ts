import { Component, OnInit, OnDestroy } from '@angular/core';
import { sensorService } from '../../services/sensor.service';
import { Subject, takeUntil } from 'rxjs';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, Firestore } from 'firebase/firestore';
import { SensorReading } from '../../services/sensor.service';
import { CommonModule } from '@angular/common';

interface SessionStats {
  startTime: Date;
  endTime?: Date;
  topSpeed: number;
  averageSpeed: number;
  maxLean: number;
  averageLean: number;
  elapsed?: number;
}

interface TestStats {
  startTime: Date;
  endTime?: Date;
  accelerationTime?: number; // Time (seconds) to reach 100 km/h
  brakingTime?: number;      // Time (seconds) from deceleration until 0 km/h
}

@Component({
  selector: 'app-track-stats',
  templateUrl: './track-stats.component.html',
  styleUrls: ['./track-stats.component.less'],
  imports: [CommonModule],
})
export class TrackStatsComponent implements OnInit, OnDestroy {
  // Declare the Firestore instance as a public property.
  public db: Firestore = getFirestore();
  
  // Overall session state
  public isTracking = false;
  public sessionStats: SessionStats | null = null;
  public showSessionActions = false;
  public timer = 0;
  private timerInterval: any = null;

  // Live sensor values
  public currentSpeed = 0;    // in km/h
  public currentLean = 0;
  public currentGForce = 0;
  public currentAcceleration = 0;  // computed from acceleration vector (m/s²)

  // Test (0–100–0 pop‑down) state
  public showTestPopup = false;
  public testActive = false;
  public testStats: TestStats | null = null;
  
  // Internal test-timing variables (now public for HTML binding)
  public hit100: boolean = false;
  public brakingStart: number = 0;
  
  // Public timer properties for the test (in seconds)
  public testAccelerationTimer: number = 0;
  public testBrakingTimer: number = 0;

  private destroy$ = new Subject<void>();

  constructor(public sensorService: sensorService) {}

  public ngOnInit() {
    this.sensorService.liveData.pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: SensorReading) => {
      // Update sensor live values
      this.currentSpeed = data.speed * 3.6; // Convert m/s to km/h
      this.currentLean = data.leanAngle;
      this.currentGForce = data.gForce;
      this.currentAcceleration = Math.sqrt(
        (data.acceleration.x || 0) ** 2 +
        (data.acceleration.y || 0) ** 2 +
        (data.acceleration.z || 0) ** 2
      );
      
      if (this.isTracking && this.sessionStats) {
        this.updateSessionStats(data);
      }
      
      if (this.testActive && this.testStats) {
        this.handleTestLogic(data);
      }
    });
  }

  private updateSessionStats(data: SensorReading): void {
    if (!this.sessionStats) { return; }
    
    this.sessionStats.topSpeed = Math.max(this.sessionStats.topSpeed, this.currentSpeed);
    this.sessionStats.maxLean = Math.max(this.sessionStats.maxLean, this.currentLean);
    this.sessionStats.averageLean =
      (this.sessionStats.averageLean * (this.sessionStats.elapsed || 0) + this.currentLean) /
      ((this.sessionStats.elapsed || 0) + 1);
    this.sessionStats.averageSpeed =
      (this.sessionStats.averageSpeed * (this.sessionStats.elapsed || 0) + this.currentSpeed) /
      ((this.sessionStats.elapsed || 0) + 1);
    this.sessionStats.elapsed = Math.floor(
      (Date.now() - this.sessionStats.startTime.getTime()) / 1000
    );
  }

  public toggleTracking() {
    this.isTracking = !this.isTracking;
    if (this.isTracking) {
      this.startNewSession();
      this.sensorService.startTracking().catch(err => {
        console.error('Failed to start tracking:', err);
        this.isTracking = false;
      });
      this.timer = 0;
      this.timerInterval = setInterval(() => this.timer++, 1000);
    } else {
      clearInterval(this.timerInterval);
      this.sensorService.stopTracking();
      if (this.sessionStats) {
        this.sessionStats.endTime = new Date();
      }
      this.showSessionActions = true;
    }
  }
  
  private startNewSession() {
    this.sessionStats = {
      startTime: new Date(),
      topSpeed: 0,
      averageSpeed: 0,
      maxLean: 0,
      averageLean: 0,
      elapsed: 0,
    };
  }

  // --- Test (0–100–0) Pop-Down Functions ---
  public startTestPopup() {
    this.showTestPopup = true;
    this.testActive = true;
    this.testStats = { startTime: new Date() };
    this.hit100 = false;
    this.brakingStart = 0;
    this.testAccelerationTimer = 0;
    this.testBrakingTimer = 0;
  }

  private handleTestLogic(data: SensorReading): void {
    if (!this.testStats) { return; }
    
    // Update acceleration timer until 100 km/h is reached.
    if (!this.hit100) {
      this.testAccelerationTimer = (Date.now() - this.testStats.startTime.getTime()) / 1000;
      if (this.currentSpeed >= 100) {
        this.testStats.accelerationTime = this.testAccelerationTimer;
        this.hit100 = true;
      }
    } else {
      // Once 100 km/h is reached, start the braking timer when speed drops below 100 km/h.
      if (this.brakingStart === 0 && this.currentSpeed < 100) {
        this.brakingStart = Date.now();
      }
      if (this.brakingStart !== 0) {
        this.testBrakingTimer = (Date.now() - this.brakingStart) / 1000;
        this.testStats.brakingTime = this.testBrakingTimer;
        if (this.currentSpeed <= 0) {
          this.endTest();
        }
      }
    }
  }

  public endTest() {
    if (this.testStats && !this.testStats.endTime) {
      this.testStats.endTime = new Date();
    }
    this.testActive = false;
  }

  public async saveTest() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.testStats) { return; }
    const testDoc = doc(this.db, `users/${user.uid}/tests`, Date.now().toString());
    await setDoc(testDoc, { ...this.testStats });
    this.resetTest();
  }

  public discardTest() {
    this.resetTest();
  }

  private resetTest() {
    this.testStats = null;
    this.showTestPopup = false;
    this.testActive = false;
    this.hit100 = false;
    this.brakingStart = 0;
    this.testAccelerationTimer = 0;
    this.testBrakingTimer = 0;
  }

  public async saveSession() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.sessionStats) { return; }
    const sessionDoc = doc(this.db, `users/${user.uid}/sessions`, Date.now().toString());
    await setDoc(sessionDoc, {
      ...this.sessionStats,
      endTime: this.sessionStats.endTime || new Date(),
    });
    this.resetSession();
  }

  public discardSession() {
    this.resetSession();
  }

  private resetSession() {
    this.sessionStats = null;
    this.showSessionActions = false;
    clearInterval(this.timerInterval);
    this.timer = 0;
    this.isTracking = false;
  }

  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.sensorService.stopTracking();
    clearInterval(this.timerInterval);
  }
}
