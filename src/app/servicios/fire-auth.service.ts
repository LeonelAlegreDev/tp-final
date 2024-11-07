import { Injectable } from '@angular/core';
import { Paciente } from '../interfaces/paciente';
import { createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FireAuthService {
  private isLoggedIn = false;
  get IsLoggedIn() { return this.isLoggedIn; }
  public msjError = "";
  
  user?: Paciente;

  constructor(private auth: Auth) { }

  async Signup(user: Paciente, password: string) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, user.email, password);
      if (res.user.email !== null && res.user.uid !== null) {
        this.user = user;
        this.user.id = res.user.uid;
        this.isLoggedIn = true;
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
}
