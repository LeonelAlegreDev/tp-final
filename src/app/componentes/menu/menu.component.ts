import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
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
  @ViewChild("menu") menu!: ElementRef;
  fireAuthService = inject(FireAuthService);
  router = inject(Router);
  isCollapsed = false;

  ngOnInit(): void {
    // Recupera el estado de isCollapsed desde localStorage
    const collapsedState = localStorage.getItem('isCollapsed');
    this.isCollapsed = collapsedState === 'true';
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      const iconCollapse = this.menu.nativeElement.querySelector('.icon-collapse');

      this.menu.nativeElement.style = "transition: 0.5s ease-out;"
      iconCollapse.style = "transition: 0.5s ease-out;"
    }, 10);
  }

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
    // Guarda el estado de isCollapsed en localStorage
    localStorage.setItem('isCollapsed', this.isCollapsed.toString());

    console.log("Usuario aprobado:", this.fireAuthService.IsApproved());
  }

}
