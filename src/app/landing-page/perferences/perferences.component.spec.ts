import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerferencesComponent } from './perferences.component';

describe('PerferencesComponent', () => {
  let component: PerferencesComponent;
  let fixture: ComponentFixture<PerferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerferencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
