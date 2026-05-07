import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AppointmentDto {
  id: string;
  patientName: string;
  treatment: string;
  startTime: string; // ISO string
  endTime: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface DashboardStatsDto {
  totalToday: number;
  completedToday: number;
  cancelledToday: number;
  revenueToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Simulating .NET Core API responses
  
  constructor() {
    // Limpieza profunda de datos demo antiguos si existen
    const existing = localStorage.getItem('depilzone_appointments');
    if (existing) {
      const data = JSON.parse(existing);
      // Si detectamos IDs de la semilla original (1-5), limpiamos todo para empezar de cero
      if (data.some((a: any) => ['1', '2', '3', '4', '5'].includes(a.id))) {
        localStorage.removeItem('depilzone_appointments');
      }
    }
  }

  getAppointments(): Observable<AppointmentDto[]> {
    // PASO 4: Leer desde localStorage compartido ÚNICAMENTE
    const localData = JSON.parse(localStorage.getItem('depilzone_appointments') || '[]');
    
    const appointments = localData.map((a: any) => ({
      id: a.id,
      patientName: a.patientName,
      treatment: a.treatment || 'Tratamiento',
      startTime: `${a.date}T${a.time}:00`,
      endTime: `${a.date}T${a.time}:45`, // Default 45 min
      status: a.status === 'Pending' ? 'Scheduled' : a.status,
      price: a.price || 0
    }));

    return of(appointments).pipe(delay(300));
  }

  getDashboardStats(): Observable<DashboardStatsDto> {
    const localData = JSON.parse(localStorage.getItem('depilzone_appointments') || '[]');
    const today = new Date().toISOString().split('T')[0];
    const todayApps = localData.filter((a: any) => a.date === today);

    const stats: DashboardStatsDto = {
      totalToday: todayApps.length,
      completedToday: todayApps.filter((a: any) => a.status === 'Completed').length,
      cancelledToday: todayApps.filter((a: any) => a.status === 'Cancelled').length,
      revenueToday: todayApps
        .filter((a: any) => a.status === 'Completed' || a.status === 'Scheduled' || a.status === 'Confirmed')
        .reduce((sum: number, a: any) => sum + (a.price || 0), 0)
    };
    return of(stats).pipe(delay(500));
  }
}
