import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposEspecialistaComboboxComponent } from './tipos-especialista-combobox.component';

describe('TiposEspecialistaComboboxComponent', () => {
  let component: TiposEspecialistaComboboxComponent;
  let fixture: ComponentFixture<TiposEspecialistaComboboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiposEspecialistaComboboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposEspecialistaComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
