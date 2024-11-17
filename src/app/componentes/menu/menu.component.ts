import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {


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

}
