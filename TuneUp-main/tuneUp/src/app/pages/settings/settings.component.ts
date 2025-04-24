import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { sensorService } from '../../services/sensor.service';
import { updatePassword } from 'firebase/auth';


@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  imports: [CommonModule, FormsModule],
})
export class SettingsComponent {
  toastText = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    public sensorService: sensorService
  ) {}

  showToast(message: string) {
    this.toastText = message;
    setTimeout(() => this.toastText = '', 2500);
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
      this.showToast('✅ Logged out successfully');
    });
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account?')) {
      const user = this.auth.currentUser;
      user?.delete().then(() => {
        this.router.navigate(['/login']);
        this.showToast('✅ Account deleted');
      }).catch((err: any) => {
        console.error('Error deleting user:', err);
      });
    }
  }

  restartSensors() {
    this.sensorService.stopTracking();
    setTimeout(() => {
      this.sensorService.startTracking();
      this.showToast('✅ Sensors restarted');
    }, 500);
  }

  zeroLeanAngle() {
    this.sensorService.currentState.leanAngle = 0;
    this.sensorService.emitState?.();
    this.showToast('✅ Lean angle reset');
  }
  
  changePassword() {
    const newPassword = prompt('Enter your new password (min 6 characters):');
    if (!newPassword || newPassword.length < 6) {
      this.showToast('❌ Password must be at least 6 characters');
      return;
    }
  
    const confirmPassword = prompt('Confirm your new password:');
    if (newPassword !== confirmPassword) {
      this.showToast('❌ Passwords do not match');
      return;
    }
  
    const user = this.auth.currentUser;
    if (user) {
      updatePassword(user, newPassword)
        .then(() => this.showToast('✅ Password updated'))
        .catch((err: any) => {
          console.error('Password update failed:', err);
          this.showToast('❌ Failed to update password');
        });
    }
  }

  resetSensorData() {
    this.sensorService.liveData.next({
      timestamp: new Date(),
      speed: 0,
      acceleration: { x: 0, y: 0, z: 0 },
      leanAngle: 0,
      gForce: 0,
      coordinates: { lat: 0, lng: 0, alt: 0 }
    });
    this.showToast('✅ Sensor data reset');
  }
}
