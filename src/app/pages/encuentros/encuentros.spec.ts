import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Encuentros } from './encuentros';

describe('Encuentros', () => {
  let component: Encuentros;
  let fixture: ComponentFixture<Encuentros>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Encuentros]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Encuentros);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
