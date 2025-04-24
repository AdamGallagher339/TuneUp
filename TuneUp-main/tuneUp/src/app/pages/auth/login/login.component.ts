import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  isLoginMode = true;

  constructor(private authService: AuthService, private router: Router) {}

  async login() {
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = 'Login failed. Please check your credentials.';
    }
  }

  async register() {
    try {
      await this.authService.register(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = 'Registration failed. Please try again.';
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.error = '';
  }
}
