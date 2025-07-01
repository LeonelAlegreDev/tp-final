import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword, onAuthStateChanged } from '@angular/fire/auth';
import { Especialista } from '../interfaces/especialista';
import { Admin } from '../interfaces/admin';
import { sendEmailVerification, deleteUser } from 'firebase/auth';
import firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class FireAuthService {
  isLoggedIn = false;
  get IsLoggedIn() { return this.isLoggedIn; }
  public msjError = "";
  user?: Paciente | Especialista | Admin;
  userRole?: string = "";

  constructor(private auth: Auth) {
    this.LoadSession();
  }

  async Signup(user: Paciente | Especialista | Admin, password: string) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, user.email, password);
      if (res.user.email !== null && res.user.uid !== null) {
        this.user = user;
        this.user.id = res.user.uid;
        this.isLoggedIn = true;

        await sendEmailVerification(res.user);
        console.log("Email de verificacion enviado");
      }
      else{
        throw new Error("Error al crear usuario");
      }
    } catch (e: any) {
      switch (e.code) {
        case "auth/invalid-email":
          this.msjError = "Email invalido";
          break;
        case "auth/email-already-in-use":
          this.msjError = "Email ya en uso";
          break;
        case "auth/invalid-credential":
          this.msjError = "Credenciales invalidas";
          break;
        default:
          this.msjError = e.code
          break;
      }
      throw new Error(this.msjError);
    }
  }

  async Login(email: string, password: string): Promise<any> {
    try {
      const credentials = await signInWithEmailAndPassword(this.auth, email, password);
      return credentials.user;
    } catch (error) {
      throw error;
    }
  }

  async Logout() {
    try {
      await this.auth.signOut();
      this.isLoggedIn = false;
      this.user = undefined;
      this.userRole = undefined;
      this.ClearSession();
    } catch (e) {
      throw e;
    }
  }

  async SendVerificationEmail() {
    try {
      console.log("Enviando email de verificacion");
      if (this.auth.currentUser) {
        await sendEmailVerification(this.auth.currentUser);
        console.log("Email de verificacion enviado");
      }
      else console.log("No hay usuario logueado");
    } catch (e) {
      throw e;
    }
  }

  async IsVerified(): Promise<boolean> {
    console.log("Validando si el email esta verificado");
    await this.waitForAuthState(); // Ensure auth state is ready

    if (this.auth.currentUser) {
      console.log("Usuario logueado: ", this.auth.currentUser.email);
      await this.auth.currentUser.reload(); // Refresh the current user
      const isVerified = this.auth.currentUser.emailVerified || false;
      console.log("Email verificado: ", isVerified);
      return isVerified;
    }
    console.log("No hay usuario logueado");
    return false; // Default to false if no user is logged in
  }

  IsEspecialista(): boolean {
    return this.userRole === "especialista";
  }
  IsPaciente() {
    return this.userRole === "paciente";
  }
  IsAdmin(): boolean {
    return this.userRole === "admin";
  }
  IsApproved(): boolean {
    if(this.user && this.IsEspecialista() ){
      if((<Especialista>this.user)?.aprobed){
        return true;
      }
      else {
        return false
      }
    }
    else if(this.user && this.IsPaciente()){
      return true;
    }
    else if(this.user && (<Admin>this.user).aprobed){
      return true
    }
    else{
      return false;
    }

    return true;
  }
  GetEspecialidad(): string | undefined {
    if(this.IsEspecialista()){
      return (<Especialista>this.user).especialidad;
    }
    return undefined;
  }
  GetObraSocial(): string | undefined {
    if(this.IsPaciente()){
      return (<Paciente>this.user).obraSocial;
    }
    return undefined;
  }

  private async LoadSession() {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const currentTime = new Date().getTime();
      const sessionDuration = 60 * 60 * 1000; // 60 minutos

      // si la sesion no expiro
      if (currentTime - session.timestamp < sessionDuration) {
        this.isLoggedIn = session.isLoggedIn;
        this.user = session.user;
        this.userRole = session.userRole;        
      } else {
        this.ClearSession();
      }
    }
  }

  SaveSession(){
    const sessionData = {
      user: this.user,
      userRole: this.userRole,
      isLoggedIn: this.isLoggedIn,
      timestamp: new Date().getTime()
    };

    localStorage.setItem("session", JSON.stringify(sessionData));
  }

  private ClearSession(){
    localStorage.removeItem("session");
  }

  private waitForAuthState(): Promise<firebase.User | null> {
    return new Promise((resolve) => {
      this.auth.onAuthStateChanged((user) => {
        resolve(user as firebase.User | PromiseLike<firebase.User | null> | null);
      });
    });
  }


  async DeleteAccount(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) {
        throw new Error('No hay usuario autenticado.');
    }
    const userId = user.uid;

    console.log('Eliminando cuenta de fire auth:', user);
    try {
      await deleteUser(user);
      console.log('Cuenta eliminada de fire auth:', userId);
    } catch (error) {
        console.error('Error al borrar la cuenta:', error);
        throw error;
    }
  }
}
