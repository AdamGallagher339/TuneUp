import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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
  constructor(public auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password)
      .then(() => {
        this.error = '';
        this.router.navigate(['/dashboard']); // ✅ Redirect here
      })
      .catch(err => {
        this.error = err.message;
      });
  }

  register() {
    this.auth.register(this.email, this.password)
      .then(() => console.log('Registered!'))
      .catch(err => this.error = err.message);
  }
}
