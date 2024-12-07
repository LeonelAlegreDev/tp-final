import { Routes } from '@angular/router';
import { loggedInGuard } from './guards/logged-in.guard';
import { accountConfirmedGuard } from './guards/account-confirmed.guard';
import { isApprovedGuard } from './guards/is-approved.guard';
import { isAdminGuard } from './guards/is-admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'bienvenida', loadComponent: () => import('./paginas/welcome/welcome.component').then(m => m.WelcomeComponent) },
    { 
        path: 'home', 
        loadComponent: () => import('./paginas/home/home.component').then(m => m.HomeComponent),
        canActivate: [loggedInGuard, accountConfirmedGuard, isApprovedGuard]
    },
    { path: 'login', loadComponent: () => import('./paginas/login/login.component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./paginas/signup/signup.component').then(m => m.SignupComponent) },
    { path: 'error', loadComponent: () => import('./paginas/error/error.component').then(m => m.ErrorComponent) },
    { 
        path: 'verify-email', 
        loadComponent: () => import('./paginas/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        canActivate: [loggedInGuard]
    },
    { 
        path: 'unapproved-account', 
        loadComponent: () => import('./paginas/unapproved-account/unapproved-account.component').then(m => m.UnapprovedAccountComponent),
        canActivate: [loggedInGuard]
    },
    {
        path: 'users',
        loadComponent: () => import('./paginas/users/users.component').then(m => m.UsersComponent),
        canActivate: [loggedInGuard, accountConfirmedGuard, isApprovedGuard, isAdminGuard]
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./paginas/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
        canActivate: [loggedInGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./paginas/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [loggedInGuard]
    },
    // SIN GUARDS
    {
        path: 'mis-turnos',
        loadComponent: () => import('./paginas/mis-turnos/mis-turnos.component').then(m => m.MisTurnosComponent),
    },
    {
        path: 'solicitar-turno',
        loadComponent: () => import('./paginas/solicitar-turno/solicitar-turno.component').then(m => m.SolicitarTurnoComponent),
    },
    {
        path: 'buscador-pacientes',
        loadComponent: () => import('./componentes/buscador-de-pacientes/buscador-de-pacientes.component').then(m => m.BuscadorDePacientesComponent),
    },
    { path: '**', redirectTo: '/error' }
];
