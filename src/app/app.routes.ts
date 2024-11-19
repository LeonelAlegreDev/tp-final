import { Routes } from '@angular/router';
import { WelcomeComponent } from './paginas/welcome/welcome.component';
import { ErrorComponent } from './paginas/error/error.component';
import { LoginComponent } from './paginas/login/login.component';
import { SignupComponent } from './paginas/signup/signup.component';
import { HomeComponent } from './paginas/home/home.component';
import { loggedInGuard } from './guards/logged-in.guard';
import { accountConfirmedGuard } from './guards/account-confirmed.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'bienvenida', loadComponent: () => import('./paginas/welcome/welcome.component').then(m => m.WelcomeComponent) },
    { 
        path: 'home', 
        loadComponent: () => import('./paginas/home/home.component').then(m => m.HomeComponent),
        canActivate: [loggedInGuard, accountConfirmedGuard]
    },
    { path: 'login', loadComponent: () => import('./paginas/login/login.component').then(m => m.LoginComponent) },
    { path: 'signup', loadComponent: () => import('./paginas/signup/signup.component').then(m => m.SignupComponent) },
    { path: 'error', loadComponent: () => import('./paginas/error/error.component').then(m => m.ErrorComponent) },
    { path: 'verify-email', loadComponent: () => import('./paginas/verify-email/verify-email.component').then(m => m.VerifyEmailComponent) },
    { path: '**', redirectTo: '/error' }
];
