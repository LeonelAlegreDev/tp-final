import { Component, ComponentRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PacienteService } from '../../servicios/paciente.service';
import { getStorage, ref, deleteObject, getMetadata, listAll } from "firebase/storage";


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @ViewChild('horariosVCR', { read: ViewContainerRef }) horariosVCR?: ViewContainerRef;

  private router = inject(Router);
  fireAuthService = inject(FireAuthService);
  pacienteService = inject(PacienteService)

  async CerrarSession() {
    await this.fireAuthService.Logout();

    this.router.navigate(['/bienvenida']);
  }

  async DeleteAccount() {
    try {
      // mostrar id del usuario
      console.log("ID del usuario:", this.fireAuthService.user?.id);
      await this.pacienteService.DeletePaciente(this.fireAuthService.user?.id!);
      console.log("paciente eliminado de la base de datos");

      const storage = getStorage();
      const folderRef = ref(storage, `${this.fireAuthService.user?.id}/fotos`);

      // List all files in the 'fotos' subfolder
      const files = await listAll(folderRef);
      for (const fileRef of files.items) {
        await deleteObject(fileRef);
        console.log(`Archivo eliminado: ${fileRef.fullPath}`);
      }
      console.log("Archivos eliminados de Firebase Storage");

      await this.fireAuthService.DeleteAccount();
      console.log("Cuenta eliminada exitosamente");
      // this.router.navigate(['/bienvenida']);
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
    }
  }
}
