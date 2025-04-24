import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe,beforeEach,it, } from 'node:test';
import {expect } from '@jest/globals';
import { ViewStatsComponent } from './view-stats.component';

describe('ViewStatsComponent', () => {
  let component: ViewStatsComponent;
  let fixture: ComponentFixture<ViewStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
