import { Component, ComponentRef, inject, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";
import { CommonModule } from '@angular/common';
import { MisHorariosComponent } from '../../componentes/mis-horarios/mis-horarios.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MenuComponent, CapitalizePipe, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  @ViewChild('horariosVCR', { read: ViewContainerRef }) horariosVCR?: ViewContainerRef;
  private misHorariosCR?: ComponentRef<MisHorariosComponent>;

  fireAuthService = inject(FireAuthService);

  ngAfterViewInit() {
    this.CreateMisHorarios();
  }

  CreateMisHorarios() {
    if(this.misHorariosCR) {
      this.misHorariosCR.destroy();
    }

    this.misHorariosCR = this.horariosVCR?.createComponent(MisHorariosComponent);
  }


}
