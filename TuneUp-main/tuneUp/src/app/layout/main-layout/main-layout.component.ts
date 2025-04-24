// layouts/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.less']
})
export class MainLayoutComponent {
  navLinks = [
    { path: '/dashboard/record-stats', icon: '📊', label: 'Record' },
    { path: '/dashboard/view-stats', icon: '📈', label: 'History' },
    { path: '/dashboard/community', icon: '👥', label: 'Community' },
    { path: '/dashboard/settings', icon: '⚙️', label: 'Settings' }
  ];

  constructor(public router: Router) {}
}