import { TestBed } from '@angular/core/testing';

import { sensorService } from './sensor.service';
import { describe,beforeEach,it, } from 'node:test';
import {expect } from '@jest/globals';


describe('sensorService', () => {
  let service: sensorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(sensorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
