import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreetviewComponent } from './streetview.component';

describe('StreetviewComponent', () => {
  let component: StreetviewComponent;
  let fixture: ComponentFixture<StreetviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreetviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreetviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
