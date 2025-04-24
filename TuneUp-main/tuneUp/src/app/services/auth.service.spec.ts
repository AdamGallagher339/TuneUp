import { TestBed } from '@angular/core/testing';
import {describe,beforeEach,it} from 'node:test';
import { expect } from '@jest/globals';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
