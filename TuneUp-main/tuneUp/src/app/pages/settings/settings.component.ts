import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  imports: [CommonModule, FormsModule],
})
export class SettingsComponent {
  darkMode = false;
  autoStartSensors = false;
  notifications = true;

  constructor(private auth: AuthService, private router: Router) {}

  toggleDarkMode() {
    this.darkMode
      ? document.body.classList.add('dark')
      : document.body.classList.remove('dark');
  }

  logout() {
    this.auth.logout().then(() => this.router.navigate(['/login']));
  }

  deleteAccount() {
    if (confirm('Are you sure you want to delete your account?')) {
      console.log('Delete account logic goes here.');
    }
  }

  saveSettings() {
    console.log('Settings saved:', {
      darkMode: this.darkMode,
      autoStartSensors: this.autoStartSensors,
      notifications: this.notifications
    });
  }
}
