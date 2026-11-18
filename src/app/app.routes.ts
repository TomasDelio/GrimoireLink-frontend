import { Routes } from '@angular/router';
import { authGuard } from './auth/data-access/auth-guard';
import { guestGuard } from './auth/data-access/guest-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/features/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./auth/features/register/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: '',
        canActivate: [authGuard],
        children: [
          {
            path: 'inicio',
            loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
          },
          {
            path: 'personajes',
            loadComponent: () => import('./pages/characters/characters').then((m) => m.Characters),
          },
          {
            path: 'campanias',
            loadComponent: () => import('./pages/campaign/campaign').then((m) => m.Campaign),
          },
          {
            path: 'campanias/nueva',
            loadComponent: () =>import('./pages/campaign/campaign-form/campaign-form').then((m) => m.CampaignForm),
          },
          {
            path: 'campanias/:publicId',loadComponent: () =>import('./pages/campaign/campaign-detail/campaign-detail').then((m) => m.CampaignDetail),
          },
          {
            path: 'diario',
            loadComponent: () => import('./pages/notes/notes').then((m) => m.Notes),
          },
          {
            path: 'monstruos',
            loadComponent: () => import('./pages/monsters/monsters').then((m) => m.Monsters),
          },
          {
            path: 'encuentros',
           loadComponent: () => import('./encounters/features/encounter-detail/encounter-detail').then((m) => m.EncounterDetail),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];