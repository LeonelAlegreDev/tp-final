import { Routes } from '@angular/router';
import { WelcomeComponent } from './paginas/welcome/welcome.component';
import { ErrorComponent } from './paginas/error/error.component';
import { LoginComponent } from './paginas/login/login.component';
import { SignupComponent } from './paginas/signup/signup.component';

export const routes: Routes = [
    { path: '', redirectTo: '/bienvenida', pathMatch: "full" },
    { path: 'bienvenida', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'error', component: ErrorComponent },
    { path: '**', redirectTo: '/error' }

];
