import { Component,OnDestroy, OnInit } from '@angular/core';
import { FirebaseTestService } from '../../services/firebase-test.service';
import { sensorService } from '../../services/sensor.service';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { merge, Observable } from 'rxjs';
import { query, orderBy, limit } from '@angular/fire/firestore';
import { NgZone } from '@angular/core';
import { map } from 'rxjs/operators';




export interface SensorData {
  timestamp: Date;
  speed: number; 
  acceleration: { x: number; y: number; z: number };
  leanAngle: number;
  gForce: number;
  coordinates?: {
    lat: number;
    lng: number;
    alt?: number; 
  };
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-firestore-test',
  template: `
    <h2>Sensor Data Collection</h2>
    <button (click)="toggleSensorTracking()">
      {{ isTracking ? 'Stop' : 'Start' }} Sensors
    </button>
    <div *ngIf="isTracking">
    <p class="debug-info">
      Tracking active - Move device to test:
      <span *ngIf="!currentData">(Waiting for first data point...)</span>
    </p>
    </div>

    <button (click)="forceTestUpdate()">Simulate Data</button>

    <button (click)="testAdd()">Test Add User</button>
    <button (click)="testGet()">Test Get User</button>
    
    <div *ngIf="userData">
      <h3>User Retrieved:</h3>
      <pre>{{ userData | json }}</pre>
    </div>
    <div class="sensor-dashboard">
      <div class="sensor-card">
        <h3>Live Sensor Data</h3>
        
        <div class="data-row">
        <div class="data-item">
          <label>Speed:</label>
          <span>{{ currentData?.speed ?? 0 | number:'1.1-1' }} m/s</span>
          <small *ngIf="currentData?.speed === 0">(Stationary)</small>
          <br>
          <span>{{ getSpeedKmh() | number:'1.1-1' }}km/h</span>
          <small *ngIf="currentData?.speed === 0">(Stationary)</small>
        </div>

        <!-- Acceleration Display -->
        <div class="accelerometer">
          <h4>Acceleration (m/s²)</h4>
          <div class="axis">
            <span>X: {{ currentData?.acceleration?.x ?? 0 | number:'1.1-1' }}</span>
            <span>Y: {{ currentData?.acceleration?.y ?? 0 | number:'1.1-1' }}</span>
            <span>Z: {{ currentData?.acceleration?.z ?? 0 | number:'1.1-1' }}</span>
          </div>
        </div>
          
          <div class="data-item">
            <label>G-Force:</label>
            <span>{{ currentData?.gForce || 0 | number:'1.1-1' }}g</span>
          </div>
        </div>

        <div class="data-row">
          <div class="data-item">
            <label>Lean Angle:</label>
            <span>{{ currentData?.leanAngle || 0 | number:'1.1-1' }}°</span>
          </div>
          
          <div class="data-item">
            <label>Altitude:</label>
            <span>{{ currentData?.coordinates?.alt || 0 | number:'1.1-1' }}m</span>
          </div>
        </div>

        <div class="accelerometer">
          <h4>Acceleration</h4>
          <div class="axis">
            <span>X: {{ currentData?.acceleration?.x || 0 | number:'1.1-1' }}</span>
            <span>Y: {{ currentData?.acceleration?.y || 0 | number:'1.1-1' }}</span>
            <span>Z: {{ currentData?.acceleration?.z || 0 | number:'1.1-1' }}</span>
          </div>
        </div>

        <div class="map-preview" *ngIf="currentData?.coordinates">
          <small>Location: 
            {{ currentData?.coordinates?.lat | number:'1.4-4' }}, 
            {{ currentData?.coordinates?.lng | number:'1.4-4' }}
          </small>
        </div>
      </div>
    </div>
  `
})

export class FirebaseTestComponent implements OnInit, OnDestroy {
  userData: any;
  isTracking = false;
  currentData?: SensorData;
  private dataSub?: Subscription;
  showIOSPermissionPrompt = false;
  private firestoreData$!: Observable<SensorData>;

  constructor(
    private ngZone: NgZone,
    private firestore: Firestore,
    private firebaseTest: FirebaseTestService,
    private sensorService: sensorService 
  ) {}

  ngOnInit() {
    this.firestoreData$ = collectionData(
      query(
        collection(this.firestore, 'sensorReadings'),
        orderBy('timestamp', 'desc'),
        limit(1)
      )
    ).pipe(map(data => data[0] as SensorData));

    this.startLiveUpdates();
  }

  getSpeedKmh(): number {
    return this.currentData?.speed ? this.currentData.speed * 3.6 : 0;
  }

  startLiveUpdates() {
    this.dataSub = merge(
      this.firestoreData$,
      this.sensorService.liveData
    ).subscribe({
      next: (data) => {
        this.ngZone.run(() => {
          this.currentData = this.formatSensorData(data);
          console.log('UI Update:', this.currentData);
        });
      },
      error: (err) => console.error('Stream Error:', err)
    });
  }

  private formatSensorData(data: any): SensorData {
    return {
      ...data,
      speed: +(data.speed?.toFixed(1) || 0),
      gForce: +(data.gForce?.toFixed(2) || 0),
      coordinates: data.coordinates ? {
        lat: +(data.coordinates.lat?.toFixed(6)),
        lng: +(data.coordinates.lng?.toFixed(6)),
        alt: +(data.coordinates.alt?.toFixed(1) || 0)
      } : undefined
    };
  }

  ngOnDestroy() {
    this.dataSub?.unsubscribe();
  }

  forceTestUpdate() {
    this.sensorService.liveData.next({
      timestamp: new Date(),
      speed: 25.5,
      acceleration: { x: 0.5, y: -0.3, z: 9.8 },
      leanAngle: 12.7,
      gForce: 1.2,
      coordinates: { lat: 51.5074, lng: -0.1278, alt: 10 } // Fixed ALT property
    });
  }
  async testAdd() {
    const success = await this.firebaseTest.testAddUser();
    alert(success ? 'User added successfully!' : 'Failed to add user');
  }

  async testGet() {
    this.userData = await this.firebaseTest.testGetUser();
  }

  async startTracking() {
    try {
      await this.sensorService.startTracking();
      this.isTracking = true;
    } catch (error) {
      // Show iOS permission prompt in UI
      this.showIOSPermissionPrompt = true; 
    }
  }
  
  async grantIOSPermissions() {
    try {
      await this.sensorService.requestIOSPermissions();
      await this.sensorService.startTracking();
      this.showIOSPermissionPrompt = false;
      this.isTracking = true;
    } catch (error) {
      console.error('Permissions denied:', error);
    }
  }

  async toggleSensorTracking() {
    if (this.isTracking) {
      this.sensorService.stopTracking();
      this.isTracking = false;
    } else {
      try {
        await this.sensorService.startTracking();
        this.isTracking = true;
      } catch (error) {
        if (this.sensorService.isIOS) {
          this.showIOSPermissionPrompt = true; // Show iOS prompt
        }
      }
    }
  }
  

}
