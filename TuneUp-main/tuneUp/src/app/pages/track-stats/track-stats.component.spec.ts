import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackStatsComponent } from './track-stats.component';

describe('TrackStatsComponent', () => {
  let component: TrackStatsComponent;
  let fixture: ComponentFixture<TrackStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
