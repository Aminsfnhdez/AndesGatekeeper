import { Routes } from '@angular/router';
import { privateGuard, publicGuard } from './core/auth.guard';

export const routes: Routes = [
    {
        canActivateChild: [publicGuard()],
        path: 'auth',
        loadChildren: () => import('./auth/features/auth.routes'),
    },
    {
        canActivateChild: [privateGuard()],
        path: 'administrador',
        loadComponent: () => import('./shared/ui/layout.component'),
        loadChildren: () => import('./Administrador/features/docente.routes'),

    },
    {
        canActivateChild: [publicGuard()],
        path: '**', //aqui va si se ingresa una ruta invalida
        redirectTo: '/administrador',
    }
];
