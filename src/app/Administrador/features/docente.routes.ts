import { Routes } from '@angular/router';
import LayoutComponent from '../../shared/ui/layout.component';

export default [
  {
    path: '',
    loadComponent: () => import('./lista-docentes/lista-docentes.component'),
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reportes/reportes.component'),
  },
  {
    path: 'docentes',
    loadComponent: () => import('./lista-docentes/lista-docentes.component'),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.component'),
  }
] as Routes;
