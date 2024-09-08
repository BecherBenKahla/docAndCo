import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdavancedSearchComponent } from './adavanced-search.component';

describe('AdavancedSearchComponent', () => {
  let component: AdavancedSearchComponent;
  let fixture: ComponentFixture<AdavancedSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdavancedSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdavancedSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
