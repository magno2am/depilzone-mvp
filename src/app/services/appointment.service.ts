import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface AppointmentDto {
  id: string;
  patientName: string;
  treatmentArea: string;
  date: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  // Simulación de un Endpoint de .NET Core (ej. GET /api/Appointments)

  getAppointmentsAsync(): Observable<AppointmentDto[]> {
    // PASO 4: Sincronización con depilzone_appointments
    const localData = JSON.parse(localStorage.getItem('depilzone_appointments') || '[]');

    const apps = localData.map((a: any) => ({
      id: a.id,
      patientName: a.patientName,
      treatmentArea: a.treatment || 'General',
      date: `${a.date}T${a.time}:00`,
      status: a.status === 'Pending' ? 'Scheduled' : a.status
    }));

    return of(apps).pipe(delay(300));
  }

  getAppointmentsForTodayAsync(): Observable<AppointmentDto[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsAsync().pipe(
      delay(200),
      map(apps => apps.filter(a => a.date.startsWith(today)))
    );
  }
}
import { map } from 'rxjs/operators';
