import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscadorDePacientesComponent } from './buscador-de-pacientes.component';

describe('BuscadorDePacientesComponent', () => {
  let component: BuscadorDePacientesComponent;
  let fixture: ComponentFixture<BuscadorDePacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuscadorDePacientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuscadorDePacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
