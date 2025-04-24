// src/app/pages/dashboard/dashboard.component.ts
// src/app/pages/dashboard/dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less']
})
export class DashboardComponent {
  showBackButton = false;

  constructor(private location: Location, private router: Router) {
    this.router.events.subscribe(() => {
      this.showBackButton = !this.router.url.includes('/dashboard/track');
    });
  }

  goBack() {
    this.location.back();
  }
}