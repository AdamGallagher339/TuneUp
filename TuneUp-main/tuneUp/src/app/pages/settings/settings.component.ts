import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SettingsComponent {
  darkMode = false;
  language = 'en';

  constructor(private auth: AuthService, private router: Router) {}

  toggleDarkMode() {
    document.body.classList.toggle('dark', this.darkMode);
    this.saveSettings();
  }

  saveSettings() {
    console.log('🛠 Settings saved:', {
      darkMode: this.darkMode,
      language: this.language
    });
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
