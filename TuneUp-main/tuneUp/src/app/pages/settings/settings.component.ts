import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorService } from 'src/app/services/sensor.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})
export class SettingsComponent {
  private sensorService = inject(SensorService);
  private authService = inject(AuthService);

  toastText: string | null = null;

  showToast(message: string) {
    this.toastText = message;
    setTimeout(() => (this.toastText = null), 3000);
  }

  restartSensors() {
    this.sensorService.restartSensors();
    this.showToast('🔄 Sensors restarted!');
  }

  zeroLean() {
    this.sensorService.zeroLeanAngle();
    this.showToast('🧭 Lean angle zeroed.');
  }

  resetSensors() {
    this.sensorService.resetSensorData();
    this.showToast('♻️ Sensor data reset.');
  }

  logout() {
    this.authService.logout();
    this.showToast('🚪 Logged out');
  }

  changePassword() {
    this.authService.sendPasswordResetEmail();
    this.showToast('📧 Password reset email sent.');
  }

  deleteAccount() {
    this.authService.deleteAccount().then(() => {
      this.showToast('⚠️ Account deleted.');
    });
  }
}
