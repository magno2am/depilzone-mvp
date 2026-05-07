import { Injectable } from '@angular/core';

export interface Treatment {
  id: string;
  name: string;
  price: number;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private ownerPhone = '51960227116';
  private treatments: Treatment[] = [
    { id: 'axilas', name: 'Axilas', price: 40, icon: '✨' },
    { id: 'piernas', name: 'Piernas', price: 120, icon: '🦵' },
    { id: 'rostro', name: 'Rostro', price: 60, icon: '👤' },
    { id: 'espalda', name: 'Espalda', price: 90, icon: '👕' },
    { id: 'completo', name: 'Cuerpo Completo', price: 350, icon: '🌟' }
  ];

  constructor() {
    // No initialization needed as methods handle defaults
  }

  getOwnerPhone(): string {
    return localStorage.getItem('ownerPhone') || this.ownerPhone;
  }

  setOwnerPhone(phone: string) {
    localStorage.setItem('ownerPhone', phone);
  }

  getTreatments(): Treatment[] {
    const saved = localStorage.getItem('treatments');
    return saved ? JSON.parse(saved) : this.treatments;
  }

  updateTreatmentPrice(id: string, newPrice: number) {
    const current = this.getTreatments();
    const index = current.findIndex(t => t.id === id);
    if (index !== -1) {
      current[index].price = newPrice;
      localStorage.setItem('treatments', JSON.stringify(current));
    }
  }

  // --- SISTEMA DE SINCRONIZACIÓN UNIFICADO ---
  
  private readonly STORAGE_KEY = 'depilzone_appointments';

  getBookedAppointments(): any[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  saveAppointment(appt: any): void {
    const all = this.getBookedAppointments();
    const index = all.findIndex(a => a.id === appt.id);
    if (index !== -1) {
      all[index] = appt;
    } else {
      all.push(appt);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  isTimeBooked(date: string, time: string): boolean {
    const apps = this.getBookedAppointments();
    // Normalizar la fecha de entrada por si acaso
    const normalizedInputDate = new Date(date + 'T00:00:00').toISOString().split('T')[0];
    
    return apps.some(a => {
      // Normalizar la fecha guardada
      const normalizedStoredDate = new Date(a.date + 'T00:00:00').toISOString().split('T')[0];
      return normalizedStoredDate === normalizedInputDate && a.time === time && a.status !== 'Cancelled';
    });
  }

  getAppointments(): any[] {
    return this.getBookedAppointments();
  }

  isSlotAvailable(date: string, time: string): boolean {
    return !this.isTimeBooked(date, time);
  }
}
