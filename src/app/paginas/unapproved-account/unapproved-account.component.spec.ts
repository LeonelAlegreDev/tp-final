import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnapprovedAccountComponent } from './unapproved-account.component';

describe('UnapprovedAccountComponent', () => {
  let component: UnapprovedAccountComponent;
  let fixture: ComponentFixture<UnapprovedAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnapprovedAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnapprovedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
