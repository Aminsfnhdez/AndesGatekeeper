import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaDocentesComponent } from './lista-docentes.component';

describe('ListaDocentesComponent', () => {
  let component: ListaDocentesComponent;
  let fixture: ComponentFixture<ListaDocentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDocentesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaDocentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
