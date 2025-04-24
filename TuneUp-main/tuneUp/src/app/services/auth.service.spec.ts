import { Injectable } from '@angular/core';
import { Auth, User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser: User | null = null;

  constructor(private auth: Auth, private router: Router) {
    // ✅ Listen for user state and update
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  get user() {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, password);
    // 👇 Firebase may auto-login here, but user state might take a sec to emit
    // Router redirect should happen after user is confirmed by the guard
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }
}
