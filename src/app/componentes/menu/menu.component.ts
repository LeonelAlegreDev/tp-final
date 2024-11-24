import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FireAuthService } from '../../servicios/fire-auth.service';
import { CapitalizePipe } from "../../pipes/capitalize.pipe";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CapitalizePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  @ViewChild("menu") menu!: ElementRef
  fireAuthService = inject(FireAuthService)
  isCollapsed = false;

  SublistClick(event: Event): void {
    let target = event.target as HTMLElement;
    let parentElement = target.parentElement as HTMLElement;

    // Solo afecta al item que tiene una lista de subitems
    if(parentElement.classList.contains('item-list')){
      console.log("SublistClick", parentElement);

      if(parentElement.classList.contains('active')){
        parentElement.classList.remove('active');
      }
      else parentElement.classList.add('active');
    }
  }

  ToggleMenu(): void {
    this.isCollapsed = !this.isCollapsed;

    switch(this.isCollapsed){
      case true:
      this.menu.nativeElement.classList.add('collapsed');
      break;
      
      case false:
      this.menu.nativeElement.classList.remove('collapsed');
        break;
    }
  }

}
