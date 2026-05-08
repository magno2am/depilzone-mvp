import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FormsModule } from '@angular/forms';
import { SettingsService, Treatment, Branch, Appointment, AppointmentStatus, EffectiveStatus } from '../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, FormsModule],
  template: `
    <div class="relative bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 h-[calc(100vh-140px)] flex flex-col animate-fade-in overflow-hidden">

      <!-- Premium Header -->
      <div class="mb-5 flex flex-col gap-4">
        <!-- Row 1: title + controls -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">Agenda Inteligente</h2>
            <p class="text-xs text-slate-400 mt-0.5">{{todayLabel}} · Clic en un evento para gestionar</p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <!-- Branch filter -->
            <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase">Sede:</span>
              <select [(ngModel)]="branchFilter" (change)="loadEvents()"
                class="bg-transparent border-none text-sm font-bold text-slate-700 outline-none">
                <option value="all">Todas</option>
                <option *ngFor="let b of branches" [value]="b.name">{{b.name}}</option>
              </select>
            </div>
            <button (click)="openNewModal()"
              class="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all shadow-lg shadow-emerald-200 flex items-center gap-2 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-95">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"/></svg>
              Nueva Cita
            </button>
          </div>
        </div>
        <!-- Row 2: daily KPI chips -->
        <div class="flex flex-wrap gap-2">
          <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
            <div class="w-2 h-2 bg-sky-400 rounded-full"></div>
            <span class="text-xs font-bold text-slate-500">Hoy</span>
            <span class="text-sm font-black text-slate-800">{{todayCount}}</span>
          </div>
          <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
            <div class="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span class="text-xs font-bold text-slate-500">Pendientes</span>
            <span class="text-sm font-black text-slate-800">{{pendingCount}}</span>
          </div>
          <div class="flex items-center gap-2 bg-white border border-slate-100 rounded-2xl px-4 py-2 shadow-sm">
            <div class="w-2 h-2 bg-emerald-400 rounded-full"></div>
            <span class="text-xs font-bold text-slate-500">Confirmadas</span>
            <span class="text-sm font-black text-slate-800">{{confirmedCount}}</span>
          </div>
          <div class="flex items-center gap-2 bg-white border border-emerald-100 rounded-2xl px-4 py-2 shadow-sm bg-emerald-50/50">
            <span class="text-xs">S/.</span>
            <span class="text-xs font-bold text-emerald-600">Ingresos estimados</span>
            <span class="text-sm font-black text-emerald-700">{{estimatedRevenue}}</span>
          </div>
        </div>
      </div>

      <!-- Calendar -->
      <div class="flex-1 overflow-hidden" *ngIf="!isLoading">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>
      <div class="flex-1 flex items-center justify-center" *ngIf="isLoading">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
      </div>

      <!-- ===== DETAIL MODAL ===== -->
      <div *ngIf="selectedEvent" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="h-20 bg-gradient-to-r from-emerald-500 to-sky-500 relative">
            <button (click)="closeModal()" class="absolute top-3 right-3 text-white/80 hover:text-white bg-white/20 p-2 rounded-xl transition-colors">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
            </button>
            <div class="absolute -bottom-8 left-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-2xl">
              {{getTreatmentIcon(selectedEvent.extendedProps['treatment'])}}
            </div>
          </div>

          <div class="p-6 pt-12">
            <div class="mb-4">
              <span class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-block mb-2 tracking-wider"
                [class]="statusBadgeClass(selectedEvent.extendedProps['effectiveStatus'])">
                {{statusLabel(selectedEvent.extendedProps['effectiveStatus'])}}
              </span>
              <h3 class="text-xl font-black text-slate-800">{{selectedEvent.title}}</h3>
              <p class="text-slate-500 text-sm mt-0.5">{{selectedEvent.extendedProps['treatment']}}</p>
              <div class="flex items-center gap-2 mt-1">
                <svg class="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <span class="text-teal-600 text-xs font-bold">{{selectedEvent.extendedProps['branchName']}}</span>
                <span *ngIf="selectedEvent.extendedProps['promoPrice']" class="text-slate-400 text-xs">· S/. {{selectedEvent.extendedProps['promoPrice']}}</span>
              </div>
            </div>

            <!-- Sessions bar -->
            <div *ngIf="selectedEvent.extendedProps['sessions']" class="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div class="flex justify-between items-center mb-1.5">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sesiones</span>
                <span class="text-[10px] font-black text-teal-600">
                  {{selectedEvent.extendedProps['sessions'] - selectedEvent.extendedProps['sessionsUsed']}} restantes
                  de {{selectedEvent.extendedProps['sessions']}}
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-1.5">
                <div class="bg-teal-500 h-1.5 rounded-full transition-all"
                  [style.width]="((selectedEvent.extendedProps['sessionsUsed'] / selectedEvent.extendedProps['sessions']) * 100) + '%'">
                </div>
              </div>
            </div>

            <div class="space-y-2.5 mb-5 text-sm text-slate-600">
              <div class="flex items-center gap-2.5">
                <div class="p-1.5 bg-slate-50 rounded-lg shrink-0">
                  <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <span>{{formatEventTime(selectedEvent.start)}} &mdash; {{formatEventTime(selectedEvent.end)}}</span>
              </div>
              <div *ngIf="selectedEvent.extendedProps['whatsapp']" class="flex items-center gap-2.5">
                <div class="p-1.5 bg-slate-50 rounded-lg shrink-0">
                  <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <span>{{selectedEvent.extendedProps['whatsapp']}}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button (click)="contactWhatsapp(selectedEvent)"
                class="flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                Contactar
              </button>
              <button (click)="openEditModal()"
                class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-sm transition-colors">
                Editar
              </button>
              <button *ngIf="selectedEvent.extendedProps['status'] === 'Pending'"
                (click)="approveEvent()"
                class="col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                Confirmar Reserva
              </button>
              <button *ngIf="selectedEvent.extendedProps['status'] !== 'Cancelled'"
                (click)="cancelEvent()"
                class="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2.5 rounded-xl text-sm transition-colors">
                Cancelar
              </button>
              <button (click)="deleteEvent()"
                class="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                [class.col-span-2]="selectedEvent.extendedProps['status'] === 'Cancelled'">
                Eliminar
              </button>
            </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== EDIT MODAL ===== -->
      <div *ngIf="isEditModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800">Editar Cita</h3>
            <button (click)="isEditModalOpen = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="modal-label">Paciente</label>
                <input type="text" [(ngModel)]="editForm.patientName" class="modal-input">
              </div>
              <div class="col-span-2">
                <label class="modal-label">WhatsApp</label>
                <input type="tel" [(ngModel)]="editForm.whatsapp" class="modal-input">
              </div>
              <div>
                <label class="modal-label">Tratamiento</label>
                <select [(ngModel)]="editForm.treatment" class="modal-input">
                  <option *ngFor="let t of treatments" [value]="t.name">{{t.name}}</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Sede</label>
                <select [(ngModel)]="editForm.branchName" class="modal-input">
                  <option *ngFor="let b of branches" [value]="b.name">{{b.name}}</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Estado</label>
                <select [(ngModel)]="editForm.status" class="modal-input">
                  <option value="Pending">Pendiente</option>
                  <option value="Scheduled">Confirmada</option>
                  <option value="Cancelled">Cancelada</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Sesiones</label>
                <select [(ngModel)]="editForm.sessions" class="modal-input">
                  <option [value]="3">3</option>
                  <option [value]="6">6</option>
                  <option [value]="9">9</option>
                  <option [value]="12">12</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Fecha</label>
                <input type="date" [(ngModel)]="editForm.date" class="modal-input">
              </div>
              <div>
                <label class="modal-label">Hora</label>
                <select [(ngModel)]="editForm.time" class="modal-input">
                  <option *ngFor="let h of allHours" [value]="h">{{h}}</option>
                </select>
              </div>
            </div>
            <div class="flex gap-3 pt-2">
              <button (click)="isEditModalOpen = false" class="flex-1 py-3 border border-slate-200 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 text-sm">
                Cancelar
              </button>
              <button (click)="saveEdit()" class="flex-[2] bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-2xl text-sm transition-colors">
                GUARDAR CAMBIOS
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== NEW APPOINTMENT MODAL ===== -->
      <div *ngIf="isNewModalOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 class="text-lg font-bold text-slate-800">Nueva Cita Manual</h3>
            <button (click)="isNewModalOpen = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="modal-label">Nombre del Paciente <span class="text-rose-500">*</span></label>
                <input type="text" [(ngModel)]="newForm.patientName" class="modal-input" placeholder="Nombre completo">
              </div>
              <div class="col-span-2">
                <label class="modal-label">WhatsApp</label>
                <input type="tel" [(ngModel)]="newForm.whatsapp" class="modal-input" placeholder="+51...">
              </div>
              <div>
                <label class="modal-label">Tratamiento</label>
                <select [(ngModel)]="newForm.treatment" class="modal-input">
                  <option *ngFor="let t of treatments" [value]="t.name">{{t.name}}</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Sesiones</label>
                <select [(ngModel)]="newForm.sessions" class="modal-input">
                  <option [value]="3">3</option>
                  <option [value]="6">6</option>
                  <option [value]="9">9</option>
                  <option [value]="12">12</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Sede <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="newForm.branchName" class="modal-input">
                  <option *ngFor="let b of branches" [value]="b.name">{{b.name}}</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Estado</label>
                <select [(ngModel)]="newForm.status" class="modal-input">
                  <option value="Pending">Pendiente</option>
                  <option value="Scheduled">Confirmada</option>
                </select>
              </div>
              <div>
                <label class="modal-label">Fecha <span class="text-rose-500">*</span></label>
                <input type="date" [(ngModel)]="newForm.date" class="modal-input">
              </div>
              <div>
                <label class="modal-label">Hora <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="newForm.time" class="modal-input">
                  <option *ngFor="let h of allHours" [value]="h">{{h}}</option>
                </select>
              </div>
            </div>
            <button (click)="createAppointment()"
              [disabled]="!newForm.patientName || !newForm.date || !newForm.branchName"
              class="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-bold py-3 rounded-2xl text-sm transition-colors">
              GUARDAR CITA
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-label { @apply block text-xs font-bold uppercase text-slate-400 mb-1; }
    .modal-input { @apply w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 text-sm; }
    :host ::ng-deep .fc { --fc-border-color: #f1f5f9; --fc-today-bg-color: #f8fafc; font-family: Inter, sans-serif; }
    :host ::ng-deep .fc-button { background: #fff !important; border: 1px solid #e2e8f0 !important; color: #64748b !important; font-weight: 700 !important; border-radius: 10px !important; text-transform: capitalize !important; font-size: 0.75rem !important; padding: 0.4rem 0.75rem !important; }
    :host ::ng-deep .fc-button-primary:not(:disabled).fc-button-active { background: #0f172a !important; color: #fff !important; border-color: #0f172a !important; }
  `]
})
export class CalendarComponent implements OnInit, OnDestroy {
  isLoading = true;
  selectedEvent: any = null;
  isEditModalOpen = false;
  isNewModalOpen = false;

  treatments: Treatment[] = [];
  branches: Branch[] = [];
  branchFilter = 'all';

  // Header metrics
  todayLabel = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
  todayCount = 0;
  pendingCount = 0;
  confirmedCount = 0;
  estimatedRevenue = 0;

  allHours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

  newForm = { patientName: '', whatsapp: '', treatment: '', sessions: 6, branchName: '', date: '', time: '09:00', status: 'Scheduled' as AppointmentStatus };
  editForm = { id: '', patientName: '', whatsapp: '', treatment: '', sessions: 6, branchName: '', date: '', time: '', status: '' as AppointmentStatus };

  private sub!: Subscription;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    slotMinTime: '08:00:00',
    slotMaxTime: '22:00:00',
    allDaySlot: false,
    height: '100%',
    locale: 'es',
    events: [],
    eventMinHeight: 60,
    eventContent: (arg) => {
      const status = arg.event.extendedProps['status'];
      const treatment = arg.event.extendedProps['treatment'];
      const branch = arg.event.extendedProps['branchName'] || '';
      const icon = this.getTreatmentIcon(treatment);
      const badge = this.getBranchBadge(branch);
      const cancelled = status === 'Cancelled';
      const badgeBg = status === 'Scheduled' ? 'rgba(0,0,0,0.15)' : status === 'Pending' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.1)';
      return {
        html: `<div class="p-2 flex flex-col h-full overflow-hidden ${cancelled ? 'opacity-40' : ''}" style="cursor:pointer">
          <div class="flex items-start gap-1.5 mb-1">
            <span class="text-sm leading-none">${icon}</span>
            <div class="font-black truncate text-[11px] text-white uppercase leading-tight flex-1">${arg.event.title}</div>
          </div>
          <div class="text-[9px] text-white/80 font-semibold truncate">${treatment}</div>
          <div class="flex items-center justify-between mt-auto pt-1">
            <div class="text-[8px] text-white/70">${arg.timeText}</div>
            <div class="text-[8px] font-black text-white/90 bg-black/20 px-1.5 py-0.5 rounded-full">${badge}</div>
          </div>
        </div>`
      };
    },
    eventClick: (info) => { this.selectedEvent = info.event; }
  };

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.treatments = this.settings.getTreatments();
    this.branches = this.settings.getBranches();
    this.newForm.treatment = this.treatments[0]?.name || '';
    this.newForm.branchName = this.branches[0]?.name || '';

    this.sub = this.settings.getAppointments$().subscribe(() => {
      this.computeMetrics();
      this.loadEvents();
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  loadEvents() {
    this.isLoading = true;
    const all = this.settings.getAppointments();
    const filtered = this.branchFilter === 'all' ? all : all.filter(a => a.branchName === this.branchFilter);
    this.calendarOptions.events = this.toCalendarEvents(filtered);
    this.isLoading = false;
  }

  toCalendarEvents(appts: Appointment[]): EventInput[] {
    return appts.map(a => {
      const color = this.getEventColor(a);
      const eff = this.settings.computeEffectiveStatus(a);
      return {
        id: a.id,
        title: a.patientName,
        start: `${a.date}T${a.time}:00`,
        end: `${a.date}T${a.time}:45`,
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          status: a.status,
          effectiveStatus: eff,
          treatment: a.treatment,
          sessions: a.sessions,
          sessionsUsed: a.sessionsUsed || 0,
          branchName: a.branchName,
          whatsapp: a.whatsapp,
          promoPrice: a.promoPrice
        }
      };
    });
  }

  getBranchBadge(name: string): string {
    const map: Record<string, string> = {
      'Surco': 'SURCO',
      'Pueblo Libre': 'P.LIBRE',
      'Independencia': 'MEGA',
      'Izaguirre / Los Olivos': 'IZA'
    };
    return map[name] || name.substring(0, 5).toUpperCase();
  }

  computeMetrics() {
    const all = this.settings.getAppointments();
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = all.filter(a => a.date === today && a.status !== 'Cancelled');
    this.todayCount = todayAppts.length;
    this.pendingCount = all.filter(a => a.status === 'Pending').length;
    this.confirmedCount = all.filter(a => a.status === 'Scheduled').length;
    this.estimatedRevenue = all
      .filter(a => a.status === 'Scheduled')
      .reduce((s, a) => s + (a.promoPrice || 0), 0);
  }

  getTreatmentIcon(name: string): string {
    return this.treatments.find(t => t.name === name)?.icon || '✨';
  }

  /** Map EffectiveStatus to calendar event color */
  getEventColor(appt: Appointment): string {
    const eff = this.settings.computeEffectiveStatus(appt);
    const colors: Record<EffectiveStatus, string> = {
      Pending: '#f97316',
      Scheduled: '#10b981',
      in_progress: '#0ea5e9',
      completed: '#94a3b8',
      Cancelled: '#fca5a5'
    };
    return colors[eff] || '#10b981';
  }

  statusBadgeClass(eff: EffectiveStatus): string {
    const map: Record<EffectiveStatus, string> = {
      Pending: 'bg-orange-100 text-orange-600',
      Scheduled: 'bg-emerald-100 text-emerald-700',
      in_progress: 'bg-sky-100 text-sky-700',
      completed: 'bg-slate-100 text-slate-500',
      Cancelled: 'bg-rose-50 text-rose-500'
    };
    return map[eff] || 'bg-slate-100 text-slate-500';
  }

  statusLabel(eff: EffectiveStatus): string {
    const map: Record<EffectiveStatus, string> = {
      Pending: 'Pendiente',
      Scheduled: 'Confirmada',
      in_progress: 'En curso',
      completed: 'Completada',
      Cancelled: 'Cancelada'
    };
    return map[eff] || eff;
  }

  formatEventTime(d: Date | null): string {
    if (!d) return '';
    return new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  closeModal() { this.selectedEvent = null; }

  approveEvent() {
    this.settings.updateAppointmentStatus(this.selectedEvent.id, 'Scheduled');
    this.closeModal();
  }

  cancelEvent() {
    if (confirm('¿Cancelar esta cita?')) {
      this.settings.updateAppointmentStatus(this.selectedEvent.id, 'Cancelled');
      this.closeModal();
    }
  }

  deleteEvent() {
    if (confirm('¿Eliminar esta cita permanentemente?')) {
      this.settings.deleteAppointment(this.selectedEvent.id);
      this.closeModal();
    }
  }

  contactWhatsapp(event: any) {
    const phone = (event.extendedProps['whatsapp'] || '').replace(/\D/g, '');
    if (!phone) { alert('Esta cita no tiene WhatsApp registrado.'); return; }
    const start = new Date(event.start);
    const dateStr = start.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = this.formatEventTime(event.start);
    const lines = [
      'DEPILZONE — Recordatorio de Cita',
      '',
      `Estimado(a) ${event.title},`,
      `Le recordamos su cita programada para:`,
      '',
      `Tratamiento: ${event.extendedProps['treatment']}`,
      `Fecha: ${dateStr}`,
      `Hora: ${timeStr}`,
      `Sede: ${event.extendedProps['branchName']}`,
      '',
      'Quedo atenta a cualquier consulta.',
      'Equipo DepilZone'
    ];
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  }

  openEditModal() {
    const e = this.selectedEvent;
    const start = new Date(e.start);
    this.editForm = {
      id: e.id,
      patientName: e.title,
      whatsapp: e.extendedProps['whatsapp'] || '',
      treatment: e.extendedProps['treatment'],
      sessions: e.extendedProps['sessions'] || 6,
      branchName: e.extendedProps['branchName'],
      date: start.toISOString().split('T')[0],
      time: this.formatEventTime(start),
      status: e.extendedProps['status']
    };
    this.isEditModalOpen = true;
  }

  saveEdit() {
    const original = this.settings.getAppointments().find(a => a.id === this.editForm.id);
    if (!original) return;
    const updated: Appointment = {
      ...original,
      patientName: this.editForm.patientName,
      whatsapp: this.editForm.whatsapp,
      treatment: this.editForm.treatment,
      sessions: Number(this.editForm.sessions),
      branchName: this.editForm.branchName,
      branchAddress: this.settings.getBranchByName(this.editForm.branchName)?.address || original.branchAddress,
      date: this.editForm.date,
      time: this.editForm.time,
      status: this.editForm.status
    };
    this.settings.saveAppointment(updated);
    this.isEditModalOpen = false;
    this.closeModal();
  }

  openNewModal() {
    this.newForm = { patientName: '', whatsapp: '', treatment: this.treatments[0]?.name || '', sessions: 6, branchName: this.branches[0]?.name || '', date: '', time: '09:00', status: 'Scheduled' };
    this.isNewModalOpen = true;
  }

  createAppointment() {
    if (!this.newForm.patientName || !this.newForm.date || !this.newForm.branchName) return;
    // Duplicate validation
    if (this.settings.isDuplicate(this.newForm.date, this.newForm.time, this.newForm.branchName)) {
      alert('Ya existe una cita activa en esa sede, fecha y hora.');
      return;
    }
    const branch = this.settings.getBranchByName(this.newForm.branchName);
    const treatment = this.treatments.find(t => t.name === this.newForm.treatment);
    const priceTier = treatment?.prices.find(p => p.sessions === Number(this.newForm.sessions));
    const appt: Appointment = {
      id: Date.now().toString(),
      patientName: this.newForm.patientName.trim(),
      whatsapp: this.newForm.whatsapp.trim(),
      treatment: this.newForm.treatment,
      treatmentDescription: treatment?.description || '',
      sessions: Number(this.newForm.sessions),
      sessionsUsed: 0,
      regularPrice: priceTier?.regular || 0,
      promoPrice: priceTier?.promo || 0,
      purchaseLink: treatment?.purchaseLink || '',
      branchName: this.newForm.branchName,
      branchAddress: branch?.address || '',
      date: this.newForm.date,
      time: this.newForm.time,
      status: this.newForm.status,
      createdAt: new Date().toISOString()
    };
    this.settings.saveAppointment(appt);
    this.isNewModalOpen = false;
  }
}
