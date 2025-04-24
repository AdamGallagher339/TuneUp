// src/app/services/sensor.service.ts
import { Injectable } from '@angular/core';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { SensorData } from '../components/firestore-test/firestore-test.component';

export interface SensorReading extends SensorData {
  timestamp: Date;
  speed: number;
  acceleration: { x: number; y: number; z: number };
  leanAngle: number;
  gForce: number;
  coordinates?: {
    lat: number;
    lng: number;
    alt: number;
  };
}

@Injectable({ providedIn: 'root' })
export class sensorService {
  private readonly GRAVITY = 9.81;
  // Use a regex on navigator.userAgent to check if device is iOS.
  public readonly isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  private db = getFirestore();
  private motionWatch: any;
  private orientationWatch: any;
  private gpsWatch: number | null = null;
  public liveData = new Subject<SensorReading>();

  public currentState: SensorReading = {
    timestamp: new Date(),
    speed: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    leanAngle: 0,
    gForce: 0
  };

  // Called when a new geolocation update is available.
  private handlePosition(position: GeolocationPosition): void {
    this.currentState = {
      ...this.currentState,
      timestamp: new Date(),
      speed: position.coords.speed || 0,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        alt: position.coords.altitude || 0,
      }
    };
    this.emitState();
    console.log('Raw GPS Data:', position.coords);
  }

  // Start tracking – request permissions, attach listeners, etc.
  async startTracking(): Promise<void> {
    try {
      // For iOS, check permissions using the experimental API
      if (this.isIOS && !await this.hasIOSPermissions()) {
        await this.requestIOSPermissions(); // Will throw if not granted.
      }
      // Check geolocation permission for non-iOS devices as needed.
      const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
      if (geoPermission.state !== 'granted') {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
      // Start geolocation tracking.
      this.gpsWatch = navigator.geolocation.watchPosition(
        position => this.handlePosition(position),
        error => console.error('GPS Error:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      // Listen for device motion events.
      if ('DeviceMotionEvent' in window) {
        this.motionWatch = (event: DeviceMotionEvent) => {
          this.handleMotion(event.acceleration);
        };
        window.addEventListener('devicemotion', this.motionWatch);
      }
      // Listen for device orientation events.
      if ('DeviceOrientationEvent' in window) {
        this.orientationWatch = (event: DeviceOrientationEvent) => {
          this.handleOrientation(event);
        };
        window.addEventListener('deviceorientation', this.orientationWatch);
      }
    } catch (error) {
      console.error('Sensor access denied:', error);
      this.stopTracking();
      throw error; // Let calling component handle the error.
    }
  }

  private async hasIOSPermissions(): Promise<boolean> {
    if (!this.isIOS) return true;
    try {
      // Note: requestPermission is non-standard and only present on iOS Safari.
      const motionStatus = await (DeviceMotionEvent as any).requestPermission?.();
      const orientationStatus = await (DeviceOrientationEvent as any).requestPermission?.();
      return motionStatus === 'granted' && orientationStatus === 'granted';
    } catch {
      return false;
    }
  }

  public async requestIOSPermissions(): Promise<void> {
    if (!this.isIOS) return;
    try {
      const motionStatus = await (DeviceMotionEvent as any).requestPermission();
      if (motionStatus !== 'granted') throw new Error('Motion denied');
      const orientationStatus = await (DeviceOrientationEvent as any).requestPermission();
      if (orientationStatus !== 'granted') throw new Error('Orientation denied');
    } catch (error) {
      console.error('iOS permission error:', error);
      throw error;
    }
  }

  private handleMotion(acc: DeviceMotionEvent['acceleration']): void {
    if (!acc) return;
    const gForce = Math.sqrt(
      (acc.x || 0) ** 2 +
      (acc.y || 0) ** 2 +
      (acc.z || 0) ** 2
    ) / this.GRAVITY;
    this.currentState = {
      ...this.currentState,
      acceleration: {
        x: acc.x || 0,
        y: acc.y || 0,
        z: acc.z || 0
      },
      gForce: Number(gForce.toFixed(2))
    };
    this.emitState();
  }

  private handleOrientation(event: DeviceOrientationEvent): void {
    this.currentState = {
      ...this.currentState,
      leanAngle: Math.abs(event.beta || 0)
    };
    this.emitState();
  }

  // Emit the current sensor reading to subscribers and write it to Firestore.
  public emitState(): void {
    this.liveData.next({ ...this.currentState });
    this.saveReading({ ...this.currentState });
  }

  public async requestSensorPermissions(): Promise<void> {
    if (!this.isIOS) return;
    try {
      const motionStatus = await (DeviceMotionEvent as any).requestPermission();
      if (motionStatus !== 'granted') throw new Error('Motion denied');
      const orientationStatus = await (DeviceOrientationEvent as any).requestPermission();
      if (orientationStatus !== 'granted') throw new Error('Orientation denied');
    } catch (error) {
      console.error('iOS permission error:', error);
      throw error;
    }
  }

  // Write the sensor reading to the "sensorReadings" collection.
  private saveReading(reading: SensorReading): void {
    const readingsCollection = collection(this.db, 'sensorReadings');
    addDoc(readingsCollection, reading);
  }

  // Stop all event listeners and tracking.
  stopTracking(): void {
    if (this.gpsWatch) navigator.geolocation.clearWatch(this.gpsWatch);
    if (this.motionWatch) window.removeEventListener('devicemotion', this.motionWatch);
    if (this.orientationWatch) window.removeEventListener('deviceorientation', this.orientationWatch);
  }
}
