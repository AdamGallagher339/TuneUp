import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadComponent: () => import('../app/pages/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('../app/layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'record-stats', loadComponent: () => import('./pages/track-stats/track-stats.component').then(m => m.TrackStatsComponent) },
      { path: 'view-stats', loadComponent: () => import('./pages/view-stats/view-stats.component').then(m => m.ViewStatsComponent) },
      { path: 'community', loadComponent: () => import('./pages/community/community.component').then(m => m.CommunityComponent) },
      { path: 'settings', loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent) },
      { path: '', redirectTo: 'record-stats', pathMatch: 'full' }
    ]
  }
];