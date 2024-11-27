import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Especialista } from '../interfaces/especialista';
import { Admin } from '../interfaces/admin';
import { sendEmailVerification } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FireAuthService {
  private isLoggedIn = false;
  get IsLoggedIn() { return this.isLoggedIn; }
  public msjError = "";
  user?: Paciente | Especialista | Admin;
  userRole?: string = "";

  constructor(private auth: Auth) { }

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

  async DeleteUser() {
    try {
      if (this.user) {
        await this.auth.currentUser?.delete();
        this.isLoggedIn = false;
        this.user = undefined;
      }
    } catch (e) {
      throw e;
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
  IsVerified() {
    return this.auth.currentUser?.emailVerified;
  }
  IsEspecialista(): boolean {
    if(this.userRole === "especialista") return true;

    return false;
  }
  IsPaciente() {
    if(this.userRole === "paciente") return true;
    return false;
  }
  IsAdmin(): boolean {
    if(this.userRole === "admin") return true;

    return false;
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
}
