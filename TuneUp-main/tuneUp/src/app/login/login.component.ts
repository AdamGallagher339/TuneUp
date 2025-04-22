import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  constructor(public auth: AuthService) {}

  login() {
    console.log('Trying to log in with:', this.email, this.password);
  
    this.auth.login(this.email, this.password)
      .then(user => console.log('✅ Logged in:', user))
      .catch(err => {
        console.error('❌ Login failed:', err);
        this.error = err.message;
      });
  }

  register() {
    this.auth.register(this.email, this.password)
      .then(() => console.log('Registered!'))
      .catch(err => this.error = err.message);
  }
}
