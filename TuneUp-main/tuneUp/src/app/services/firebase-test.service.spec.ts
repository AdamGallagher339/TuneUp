import { TestBed } from '@angular/core/testing';
import { describe,beforeEach,it, } from 'node:test';
import {expect } from '@jest/globals';
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
