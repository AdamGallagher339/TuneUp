import { TestBed } from '@angular/core/testing';

import { sensorService } from './sensor.service';

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
