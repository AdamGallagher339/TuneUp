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
    alt:number;
  };
}


@Injectable({ providedIn: 'root' })
export class sensorService { 
  private readonly GRAVITY = 9.81;
  public isIOS = false;

  constructor() {
    if (typeof navigator !== 'undefined') {
      this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    }
  }
  private db = getFirestore();
  private motionWatch: any;
  private orientationWatch: any;
  private gpsWatch: number | null = null;
  public liveData = new Subject<SensorReading>();

  private currentState: SensorReading = {
    timestamp: new Date(),
    speed: 0,
    acceleration: { x: 0, y: 0, z: 0 },
    leanAngle: 0,
    gForce: 0
  };

  private handlePosition(position: GeolocationPosition): void {
    this.currentState = {
      ...this.currentState,
      timestamp: new Date(),
      speed: position.coords.speed || 0,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        alt: position.coords.altitude || 0
      }
    };
    this.emitState();
    console.log('Raw GPS Data:', position.coords);

  }
  

  async startTracking(): Promise<void> {
    try {
      // iOS-specific permission flow
      if (this.isIOS && !await this.hasIOSPermissions()) {
        await this.requestIOSPermissions(); // Will throw if denied
      }
  
      // Original permission check for non-iOS
      const geoPermission = await navigator.permissions.query({ name: 'geolocation' });
      if (geoPermission.state !== 'granted') {
        await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }
  
      // Start sensors (existing code)
      this.gpsWatch = navigator.geolocation.watchPosition(
        position => this.handlePosition(position),
        error => console.error('GPS Error:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
  
      if ('DeviceMotionEvent' in window) {
        this.motionWatch = (event: DeviceMotionEvent) => {
          this.handleMotion(event.acceleration);
        };
        window.addEventListener('devicemotion', this.motionWatch);
      }
  
      if ('DeviceOrientationEvent' in window) {
        this.orientationWatch =  (event: DeviceOrientationEvent) => {
          this.handleOrientation(event);
        };
        window.addEventListener('deviceorientation', this.orientationWatch);
      }
  
    } catch (error) {
      console.error('Sensor access denied:', error);
      this.stopTracking();
      throw error; // Re-throw to handle in component
    }
  }

  private async hasIOSPermissions(): Promise<boolean> {
    if (!this.isIOS) return true;
    
    try {
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
      // Must be called from user gesture handler (like button click)
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
    (acc.x || 0)**2 + 
    (acc.y || 0)**2 + 
    (acc.z || 0)**2
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

private emitState(): void {
  this.liveData.next({...this.currentState});
  this.saveReading({...this.currentState});
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

  private saveReading(reading: SensorReading): void {
    const readingsCollection = collection(this.db, 'sensorReadings');
    addDoc(readingsCollection, reading);
  }

  stopTracking(): void {
    if (this.gpsWatch) navigator.geolocation.clearWatch(this.gpsWatch);
    if (this.motionWatch) window.removeEventListener('devicemotion', this.motionWatch);
    if (this.orientationWatch) window.removeEventListener('deviceorientation', this.orientationWatch);
  }
}