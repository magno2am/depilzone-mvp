import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../services/api.service';
import { SettingsService, Treatment } from '../services/settings.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  template: `
    <div class="relative bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100 h-[calc(100vh-140px)] flex flex-col animate-fade-in overflow-hidden">
      
      <!-- Top Bar -->
      <div class="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Calendario de Citas</h2>
          <p class="text-xs text-slate-400">Haz clic en una cita para ver detalles o gestionar.</p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#f97316]"></span> Pendiente</span>
            <span class="flex items-center gap-1 ml-2"><span class="w-2 h-2 rounded-full bg-[#10b981]"></span> Confirmada</span>
          </div>
          <button class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-100 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
            Nueva Cita
          </button>
        </div>
      </div>
      
      <!-- Calendar Wrapper -->
      <div class="flex-1 overflow-hidden" *ngIf="!isLoading">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>
      
      <!-- Loading State -->
      <div class="flex-1 flex items-center justify-center" *ngIf="isLoading">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          <p class="text-slate-400 animate-pulse font-medium">Sincronizando agenda...</p>
        </div>
      </div>

      <!-- Detail Modal Overlay -->
      <div *ngIf="selectedEvent" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="h-24 bg-gradient-to-r from-emerald-500 to-sky-500 relative p-6">
            <button (click)="closeModal()" class="absolute top-4 right-4 text-white/80 hover:text-white bg-white/20 p-2 rounded-xl backdrop-blur-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
            <div class="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl">
              {{getTreatmentIcon(selectedEvent.extendedProps.treatment)}}
            </div>
          </div>
          
          <div class="p-6 pt-12">
            <div class="mb-6">
              <span class="text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-md mb-2 inline-block" 
                    [ngClass]="selectedEvent.extendedProps.status === 'PENDIENTE' ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'">
                {{selectedEvent.extendedProps.status}}
              </span>
              <h3 class="text-xl font-black text-slate-800 leading-tight">{{selectedEvent.title}}</h3>
              <p class="text-slate-400 text-sm font-medium">{{selectedEvent.extendedProps.treatment}} • S/. {{selectedEvent.extendedProps.price || '0'}}</p>
            </div>

            <div class="space-y-4 mb-8">
              <div class="flex items-center gap-3 text-slate-600 text-sm">
                <div class="p-2 bg-slate-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <div>
                  <p class="font-bold">Horario</p>
                  <p class="opacity-70">{{selectedEvent.start | date:'shortTime'}} - {{selectedEvent.end | date:'shortTime'}}</p>
                </div>
              </div>
              <div *ngIf="selectedEvent.extendedProps.whatsapp" class="flex items-center gap-3 text-slate-600 text-sm">
                <div class="p-2 bg-slate-50 rounded-lg"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                <div>
                  <p class="font-bold">Contacto</p>
                  <p class="opacity-70">{{selectedEvent.extendedProps.whatsapp}}</p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button (click)="openWhatsapp(selectedEvent)" class="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                WhatsApp
              </button>
              <button *ngIf="selectedEvent.extendedProps.status === 'PENDIENTE'" (click)="approveEvent(selectedEvent)" class="bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-2xl transition-colors">
                ✅ Aprobar
              </button>
              <button *ngIf="selectedEvent.extendedProps.status !== 'PENDIENTE'" (click)="cancelEvent(selectedEvent)" class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-2xl transition-colors">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  isLoading = true;
  selectedEvent: any = null;
  treatments: Treatment[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    allDaySlot: false,
    selectable: true,
    height: '100%',
    locale: 'es',
    events: [],
    eventContent: (arg) => {
      const status = arg.event.extendedProps['status'];
      const treatmentName = arg.event.extendedProps['treatment'];
      const icon = this.getTreatmentIcon(treatmentName);
      const isPending = status === 'PENDIENTE';
      
      return {
        html: `
          <div class="p-1.5 flex flex-col h-full overflow-hidden rounded-lg shadow-sm border-l-4 border-white/20">
            <div class="flex items-center gap-1 mb-0.5">
              <span class="text-xs">${icon}</span>
              <div class="font-black truncate text-[10px] text-white uppercase">${arg.event.title}</div>
            </div>
            <div class="text-[9px] text-white/80 font-medium truncate">${arg.timeText}</div>
            <div *ngIf="isPending" class="mt-auto self-end">
              <span class="animate-pulse">⏳</span>
            </div>
          </div>
        `
      };
    },
    eventClick: (info) => {
      this.selectedEvent = info.event;
    }
  };

  constructor(
    private api: ApiService,
    private settings: SettingsService
  ) {}

  ngOnInit() {
    this.treatments = this.settings.getTreatments();
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.api.getAppointments().subscribe(appointments => {
      // appointments ya viene mapeado correctamente desde ApiService
      const events = appointments.map(app => ({
        ...app,
        title: app.patientName,
        start: app.startTime,
        end: app.endTime
      }));
      this.calendarOptions.events = this.mapToCalendarEvents(events);
      this.isLoading = false;
    });
  }

  getTreatmentIcon(name: string): string {
    const t = this.treatments.find(tr => tr.name === name);
    return t ? t.icon : '✨';
  }

  calculateEndTime(start: string): string {
    const d = new Date(start);
    d.setMinutes(d.getMinutes() + 45); // 45 min duration default
    return d.toISOString();
  }

  mapToCalendarEvents(appointments: any[]): EventInput[] {
    return appointments.map(app => {
      let color = '#0ea5e9'; // default blue
      if (app.status === 'Completed' || app.status === 'Confirmed' || app.status === 'Scheduled') color = '#10b981';
      if (app.status === 'Cancelled') color = '#f43f5e';
      if (app.status === 'PENDIENTE' || app.status === 'Pending') color = '#f97316';

      return {
        id: app.id,
        title: app.title || app.patientName,
        start: app.start,
        end: app.end,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          whatsapp: app.whatsapp,
          status: app.status,
          treatment: app.treatment,
          price: app.price || 0
        }
      };
    });
  }

  closeModal() {
    this.selectedEvent = null;
  }

  openWhatsapp(event: any) {
    const phone = event.extendedProps.whatsapp?.replace(/\\D/g, '');
    if (!phone) return;
    const msg = `Hola ${event.title}, te escribimos de DepilZone para coordinar tu cita de ${event.extendedProps.treatment}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  approveEvent(event: any) {
    const apps = this.settings.getAppointments();
    const index = apps.findIndex(a => a.id === event.id);
    
    if (index !== -1) {
      apps[index].status = 'Scheduled';
      localStorage.setItem('depilzone_appointments', JSON.stringify(apps));
      this.loadEvents();
      this.closeModal();
      alert('Cita aprobada.');
    }
  }

  cancelEvent(event: any) {
    if (confirm('¿Seguro que deseas cancelar esta cita?')) {
      let apps = this.settings.getAppointments();
      apps = apps.filter(a => a.id !== event.id);
      localStorage.setItem('depilzone_appointments', JSON.stringify(apps));
      this.loadEvents();
      this.closeModal();
    }
  }

  handleDateSelect(info: any) { }
}

