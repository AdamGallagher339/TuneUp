import { TestBed } from '@angular/core/testing';

import { FirebaseTestService } from './firebase-test.service';

describe('FirebaseTestService', () => {
  let service: FirebaseTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
