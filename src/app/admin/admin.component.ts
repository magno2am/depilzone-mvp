import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, Appointment, AppointmentStatus } from '../services/settings.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Solicitudes Entrantes</h2>
          <p class="text-slate-500 text-sm">Reservas pendientes de aprobación desde el booking público.</p>
        </div>
        <div class="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-xs font-bold text-slate-500 uppercase tracking-tighter">En vivo</span>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="requests.length === 0"
        class="bg-white rounded-3xl p-16 shadow-sm border border-slate-100 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
        <div class="p-6 bg-slate-50 rounded-full mb-4">
          <svg class="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-1">¡Todo al día!</h3>
        <p class="text-slate-400 text-sm max-w-xs">No hay nuevas solicitudes pendientes en este momento.</p>
      </div>

      <!-- Request Cards -->
      <div class="grid grid-cols-1 gap-4">
        <div *ngFor="let req of requests"
          class="bg-white rounded-3xl p-6 shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-all animate-in slide-in-from-bottom-2">
          <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                <h3 class="font-black text-xl text-slate-800 truncate">{{req.patientName}}</h3>
                <span class="px-3 py-1 rounded-full text-[10px] font-black bg-orange-100 text-orange-600 uppercase tracking-widest shrink-0">Pendiente</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-600">
                <div class="flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
                  <span class="font-medium text-slate-700">{{req.treatment}}</span>
                  <span *ngIf="req.sessions" class="text-xs text-slate-400">· {{req.sessions}} ses.</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  <span class="font-bold text-slate-700">{{formatDate(req.date)}} · {{req.time}}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="font-bold text-emerald-700">{{req.branchName}}</span>
                </div>
                <div *ngIf="req.whatsapp" class="flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  <span class="font-medium">{{req.whatsapp}}</span>
                </div>
                <div *ngIf="req.promoPrice" class="flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <span class="font-bold text-emerald-600">S/. {{req.promoPrice}} promo</span>
                </div>
              </div>

              <!-- Slot availability -->
              <div class="mt-3">
                <span class="px-2 py-1 rounded-lg text-[10px] font-bold"
                  [class]="isSlotFree(req) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  {{ isSlotFree(req) ? '● Horario libre en esta sede' : '● Conflicto de horario en esta sede' }}
                </span>
              </div>
            </div>

            <div class="flex gap-2 w-full sm:w-auto shrink-0">
              <button (click)="approve(req)"
                class="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 text-sm">
                APROBAR
              </button>
              <button (click)="reject(req)"
                class="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-all active:scale-90" title="Cancelar">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  requests: Appointment[] = [];

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.settings.getAppointments$().subscribe(() => this.loadRequests());
  }

  loadRequests() {
    this.requests = this.settings.getAppointments().filter(a => a.status === 'Pending');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  isSlotFree(req: Appointment): boolean {
    // Check if any OTHER approved appointment blocks this slot
    return !this.settings.getAppointments().some(a =>
      a.id !== req.id &&
      a.date === req.date &&
      a.time === req.time &&
      a.branchName === req.branchName &&
      a.status === 'Scheduled'
    );
  }

  approve(req: Appointment) {
    if (!this.isSlotFree(req)) {
      if (!confirm('Este horario ya tiene una cita confirmada en esta sede. ¿Aprobar de todas formas?')) return;
    }
    this.settings.updateAppointmentStatus(req.id, 'Scheduled');

    const cleanDate = this.formatDate(req.date);
    const lines = [
      '*✅ CITA CONFIRMADA - DEPILZONE*',
      '',
      `¡Hola *${req.patientName}*! Tu reserva ha sido aprobada.`,
      '',
      `💉 *Tratamiento:* ${req.treatment} (${req.sessions} sesiones)`,
      `💰 *Precio:* S/. ${req.promoPrice}`,
      `📅 *Fecha:* ${cleanDate}`,
      `⏰ *Hora:* ${req.time}`,
      `📍 *Sede:* ${req.branchName}`,
      `🏠 *Dirección:* ${req.branchAddress}`,
      '',
      '¡Te esperamos! 🌟'
    ];
    const msg = encodeURIComponent(lines.join('\n'));
    const phone = req.whatsapp.replace(/\D/g, '');
    if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  reject(req: Appointment) {
    if (confirm(`¿Cancelar la solicitud de ${req.patientName}?`)) {
      this.settings.updateAppointmentStatus(req.id, 'Cancelled');
    }
  }
}
