import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../componentes/menu/menu.component';
import { FireAuthService } from '../../servicios/fire-auth.service';
@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent {
  fireAuthService = inject(FireAuthService)
  async SendEmail() {
    // Enviar email de verificación
    await this.fireAuthService.SendVerificationEmail();
  }
}
