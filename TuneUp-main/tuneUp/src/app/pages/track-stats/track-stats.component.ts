// Add these declarations so that TypeScript knows about am5, am5xy, am5radar, and am5themes_Animated.
declare var am5: any;
declare var am5xy: any;
declare var am5radar: any;
declare var am5themes_Animated: any;

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
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
export class TrackStatsComponent implements OnInit, AfterViewInit, OnDestroy {
  // AmCharts gauge properties:
  public root: any;
  public chart: any;
  public xAxis: any;
  public axisDataItem: any;
  public axisRenderer: any;
  public bullet: any;

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
  
  // Internal test-timing variables (public for HTML binding)
  public hit100: boolean = false;
  public brakingStart: number = 0;
  
  // Public timer properties for the test (in seconds)
  public testAccelerationTimer: number = 0;
  public testBrakingTimer: number = 0;
  
  // Flag used to indicate saving progress for the test.
  public savingTest: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(public sensorService: sensorService) {}

  // Set up sensor subscription in ngOnInit.
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
      
      if (this.testActive && this.testStats && this.axisDataItem) {
        // Instead of a random value, animate gauge pointer to currentSpeed.
        this.axisDataItem.animate({
          key: "value",
          to: this.currentSpeed,
          duration: 800,
          easing: am5.ease.out(am5.ease.cubic)
        });
        this.handleTestLogic(data);
      }
    });
  }

  // Initialize gauge after the view is rendered.
  public ngAfterViewInit() {
    am5.ready(() => {
      // Create root element
      this.root = am5.Root.new("chartdiv");
  
      // Set themes
      this.root.setThemes([
        am5themes_Animated.new(this.root)
      ]);
  
      // Create RadarChart (the gauge chart)
      this.chart = this.root.container.children.push(am5radar.RadarChart.new(this.root, {
        panX: false,
        panY: false,
        startAngle: 180,
        endAngle: 360
      }));
  
      // Create an axis renderer for the circular gauge
      this.axisRenderer = am5radar.AxisRendererCircular.new(this.root, {
        innerRadius: -10,
        strokeOpacity: 0.1
      });
  
      // Set axis labels to white.
      this.axisRenderer.labels.template.setAll({
        fill: am5.color(0xffffff)
      });
  
      // Create the value axis with a range from 0 to 200
      this.xAxis = this.chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
        maxDeviation: 0,
        min: 0,
        max: 200,
        strictMinMax: true,
        renderer: this.axisRenderer
      }));
  
      // Create the axis data item and set its initial value to 0.
      this.axisDataItem = this.xAxis.makeDataItem({});
      this.axisDataItem.set("value", 0);
  
      // Create bullet (the gauge pointer) and attach it.
      this.bullet = this.axisDataItem.set("bullet", am5xy.AxisBullet.new(this.root, {
        sprite: am5radar.ClockHand.new(this.root, {
          radius: am5.percent(99),
          fill: am5.color(0xffffff),
          stroke: am5.color(0xffffff)
        })
      }));
  
      // Create an axis range from the axis data item.
      // Capture it in a variable so we can adjust its fill settings.
      const range = this.xAxis.createAxisRange(this.axisDataItem);
      // Set the gauge bar (axis fill) to white, with appropriate opacity.
      range.get("axisFill").setAll({
        fill: am5.color(0xffffff),
        fillOpacity: 0.3,
        visible: true
      });
  
      // Optionally, hide grid lines for a cleaner look.
      this.axisDataItem.get("grid").set("visible", false);
  
      // Animate chart appearance.
      this.chart.appear(1000, 100);
  
      // ---- SIMULATION CODE (for testing) ----
      // Simulate gauge pointer movement from 0 to 200 repeatedly.
      let testValue = 0;
      setInterval(() => {
        if (testValue > 200) {
          testValue = 0;
        }
        this.axisDataItem.animate({
          key: "value",
          to: testValue,
          duration: 800,
          easing: am5.ease.out(am5.ease.cubic)
        });
        testValue += 20;
      }, 1000);
      // ---- END SIMULATION CODE ----
      
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
    this.savingTest = true;
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.testStats) { 
      this.savingTest = false;
      return; 
    }
    // Save the test data under the logged-in user's document:
    // Path: users/{user.uid}/tests/{timestamp}
    const testDoc = doc(this.db, `users/${user.uid}/tests`, Date.now().toString());
    await setDoc(testDoc, { ...this.testStats });
    this.resetTest();
    this.savingTest = false;
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
    this.savingTest = false;
  }

  public async saveSession() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !this.sessionStats) { return; }
    // Save session data to: users/{user.uid}/sessions/{timestamp}
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
