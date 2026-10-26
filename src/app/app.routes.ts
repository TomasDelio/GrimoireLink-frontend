import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MainLayout } from './layout/main-layout/main-layout';
import { Personajes } from './pages/personajes/personajes';
import { Campanias } from './pages/campanias/campanias';
import { Diario } from './pages/diario/diario';
import { Monstruos } from './pages/monstruos/monstruos';
import { Encuentros } from './pages/encuentros/encuentros';

export const routes: Routes = [
     { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Register },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'inicio', component: Dashboard },
      { path: 'personajes', component: Personajes },
      { path: 'campanias', component: Campanias },
      { path: 'diario', component: Diario },
      { path: 'monstruos', component: Monstruos },
      { path: 'encuentros', component: Encuentros },
    ],
  },
  { path: '**', redirectTo: '' },
];
