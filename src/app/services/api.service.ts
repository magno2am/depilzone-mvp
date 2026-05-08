import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { SettingsService, Appointment, AppointmentStatus } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private settings: SettingsService) {}

  getAppointments(): Observable<Appointment[]> {
    return this.settings.getAppointments$().pipe(delay(100));
  }
}

export type { Appointment, AppointmentStatus };
export interface DashboardStatsDto {
  totalToday: number;
  confirmedToday: number;
  pendingToday: number;
  revenueTotal: number;
}
