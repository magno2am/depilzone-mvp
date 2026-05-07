import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Solicitudes Entrantes</h2>
          <p class="text-slate-500">Gestión de reservas pendientes.</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div *ngIf="requests.length === 0" class="bg-white rounded-xl p-8 shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
          <div class="p-4 bg-slate-50 rounded-full mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">No hay solicitudes pendientes.</p>
        </div>
        
        <div *ngFor="let req of requests" class="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-400 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-lg text-slate-800">{{req.name}}</h3>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">PENDIENTE</span>
            </div>
            <div class="flex items-center gap-4 text-sm text-slate-500 mt-2">
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
                </svg>
                {{req.treatment}}
              </div>
              <div class="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd" />
                </svg>
                {{req.datetime | date:'short'}}
              </div>
            </div>
            <div class="mt-3 inline-block px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600">
              Estado del Horario: 
              <span class="font-bold ml-1" [class.text-emerald-600]="isAvailable(req.datetime)" [class.text-rose-600]="!isAvailable(req.datetime)">
                {{ isAvailable(req.datetime) ? 'DISPONIBLE' : 'OCUPADO' }}
              </span>
            </div>
          </div>
          <button (click)="approve(req)" class="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-transform transform hover:scale-105">
            <span>✅ APROBAR</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  requests: any[] = [];

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    // Filtrar citas con estado 'Pending' para la lista de solicitudes
    const apps = this.settings.getAppointments();
    this.requests = apps.filter(a => a.status === 'Pending');
  }

  isAvailable(date: string, time: string): boolean {
    // En el panel admin, queremos ver si YA hay una cita confirmada en ese horario
    const apps = this.settings.getAppointments();
    return !apps.some(a => a.date === date && a.time === time && (a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Completed'));
  }

  approve(req: any) {
    const apps = this.settings.getAppointments();
    const index = apps.findIndex(a => a.id === req.id);
    
    if (index !== -1) {
      apps[index].status = 'Scheduled'; // O 'Confirmed'
      localStorage.setItem('depilzone_appointments', JSON.stringify(apps));
      this.loadRequests();

      const msg = `¡Hola ${req.patientName}! Tu cita en DepilZone ha sido aprobada para el ${req.date} a las ${req.time}. Te esperamos.`;
      const phone = (req.whatsapp || '').replace(/\D/g, '');
      if (phone) {
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
      }
      alert('Cita aprobada con éxito.');
    }
  }
}
