import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  now(): number {
    return Date.now();
  }

  nowDate(): Date {
    return new Date();
  }

  nowIso(): string {
    return new Date().toISOString();
  }
}

