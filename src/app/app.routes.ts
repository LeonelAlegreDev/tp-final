import { Routes } from '@angular/router';
import { LoggedInGuard } from './guards/logged-in.guard';
import { accountConfirmedGuard } from './guards/account-confirmed.guard';
import { isApprovedGuard } from './guards/is-approved.guard';
import { isAdminGuard } from './guards/is-admin.guard';
import { canActivate } from '@angular/fire/auth-guard';
import { isAdminOrPacienteGuard } from './guards/is-admin-or-paciente.guard';
import { isPacienteOrEspecialistaGuard } from './guards/is-paciente-or-especialista.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'bienvenida', loadComponent: () => import('./paginas/welcome/welcome.component').then(m => m.WelcomeComponent) },
    { 
        path: 'home', 
        loadComponent: () => import('./paginas/home/home.component').then(m => m.HomeComponent),
        canActivate: [LoggedInGuard, accountConfirmedGuard, isApprovedGuard]
    },
    { path: 'login', loadComponent: () => import('./paginas/login/login.component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./paginas/signup/signup.component').then(m => m.SignupComponent) },
    { path: 'error', loadComponent: () => import('./paginas/error/error.component').then(m => m.ErrorComponent) },
    { 
        path: 'verify-email', 
        loadComponent: () => import('./paginas/verify-email/verify-email.component').then(m => m.VerifyEmailComponent),
        canActivate: [LoggedInGuard]
    },
    { 
        path: 'unapproved-account', 
        loadComponent: () => import('./paginas/unapproved-account/unapproved-account.component').then(m => m.UnapprovedAccountComponent),
        canActivate: [LoggedInGuard]
    },
    {
        path: 'users',
        loadComponent: () => import('./paginas/users/users.component').then(m => m.UsersComponent),
        canActivate: [LoggedInGuard, accountConfirmedGuard, isApprovedGuard, isAdminGuard]
    },
    {
        path: 'unauthorized',
        loadComponent: () => import('./paginas/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
        canActivate: [LoggedInGuard]
    },
    {
        path: 'solicitar-turno',
        loadComponent: () => import('./paginas/solicitar-turno/solicitar-turno.component').then(m => m.SolicitarTurnoComponent),
        canActivate: [LoggedInGuard, accountConfirmedGuard, isApprovedGuard, isAdminOrPacienteGuard]
    },
    {
        path: 'profile',
        loadComponent: () => import('./paginas/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [LoggedInGuard, accountConfirmedGuard]
    },
    // TODO: Falta implementar
    {
        path: 'mis-turnos',
        loadComponent: () => import('./paginas/mis-turnos/mis-turnos.component').then(m => m.MisTurnosComponent),
        canActivate: [LoggedInGuard, accountConfirmedGuard, isPacienteOrEspecialistaGuard]
    },
    {
        path: 'mis-horarios',
        loadComponent: () => import('./componentes/mis-horarios/mis-horarios.component').then(m => m.MisHorariosComponent),
    },
    { path: '**', redirectTo: '/error' }
];
