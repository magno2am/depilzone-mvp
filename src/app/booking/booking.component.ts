import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Treatment, Branch, Appointment, TreatmentPrice } from '../services/settings.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        <!-- Left: Branding -->
        <div class="bg-primary p-10 text-white relative flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 to-sky-500 opacity-90"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-8">
              <div class="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <span class="text-white font-bold text-lg">S/.</span>
              </div>
              <h1 class="text-3xl font-bold tracking-tighter uppercase">DEPILZONE</h1>
            </div>
            <h2 class="text-4xl font-extrabold leading-tight mb-6">Piel suave, <br>confianza infinita.</h2>
            <div class="space-y-3 text-emerald-50 text-sm">
              <div class="flex items-center gap-3">
                <svg class="h-4 w-4 text-emerald-300 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <p>Tecnología Láser Diodo de última generación</p>
              </div>
              <div class="flex items-center gap-3">
                <svg class="h-4 w-4 text-emerald-300 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <p>Resultados visibles desde la 1ra sesión</p>
              </div>
              <div class="flex items-center gap-3">
                <svg class="h-4 w-4 text-emerald-300 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                <p>Atención personalizada en 4 sedes en Lima</p>
              </div>
            </div>
          </div>
          <!-- Dynamic branch address -->
          <div class="relative z-10 mt-8 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-sm min-h-[64px]">
            <ng-container *ngIf="selectedBranch; else noBranch">
              <div class="flex items-center gap-2 mb-0.5">
                <svg class="h-3.5 w-3.5 text-emerald-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p class="font-bold">{{ selectedBranch.name }}</p>
              </div>
              <p class="opacity-70 mt-0.5 pl-5">{{ selectedBranch.address }}</p>
            </ng-container>
            <ng-template #noBranch>
              <div class="flex items-center gap-2 opacity-60">
                <svg class="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <p>Selecciona una sede para ver la dirección</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Right: Form -->
        <div class="p-8 md:p-10 overflow-y-auto max-h-screen">
          <div class="mb-6">
            <h3 class="text-2xl font-bold text-slate-800">Reserva tu Cita</h3>
            <p class="text-slate-500 text-sm mt-1">Coordina por aquí, paga el paquete en la web.</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-5" #bookingForm="ngForm">

            <!-- Name + WhatsApp -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="field-label">Nombre Completo</label>
                <input type="text" [(ngModel)]="booking.name" name="name" required
                  class="field-input" placeholder="Ej. María Sánchez">
              </div>
              <div>
                <label class="field-label">WhatsApp</label>
                <input type="tel" [(ngModel)]="booking.whatsapp" name="whatsapp" required
                  class="field-input" placeholder="+51 9XXXXXXXX">
              </div>
            </div>

            <!-- Treatment + Branch -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="field-label">Tratamiento</label>
                <select [(ngModel)]="booking.treatment" name="treatment"
                  (change)="onTreatmentChange()" required class="field-input">
                  <option value="" disabled>Selecciona...</option>
                  <option *ngFor="let t of treatments" [value]="t.name">{{t.name}}</option>
                </select>
              </div>
              <div>
                <label class="field-label">Sede <span class="text-rose-500">*</span></label>
                <select [(ngModel)]="booking.branchName" name="branch"
                  (change)="onBranchChange()" required class="field-input">
                  <option value="" disabled>Selecciona sede...</option>
                  <option *ngFor="let b of branches" [value]="b.name">{{b.name}}</option>
                </select>
              </div>
            </div>

            <!-- Sessions Picker -->
            <div *ngIf="selectedTreatment" class="space-y-3">
              <label class="field-label">Paquete de Sesiones</label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button *ngFor="let p of selectedTreatment.prices" type="button"
                  (click)="selectSessions(p)"
                  [class]="selectedPriceTier?.sessions === p.sessions
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'"
                  class="px-2 py-3 rounded-2xl text-sm font-bold border-2 flex flex-col items-center transition-all">
                  <span class="text-[10px] opacity-60 mb-0.5">{{p.sessions}} ses.</span>
                  <span class="font-black">S/.{{p.promo}}</span>
                </button>
              </div>
              <!-- Promo detail block - no external link, WhatsApp flow -->
              <div *ngIf="selectedPriceTier" class="rounded-2xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-300">
                <!-- Badge header -->
                <div class="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 flex items-center gap-2">
                  <svg class="h-3.5 w-3.5 text-emerald-200 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd"/></svg>
                  <span class="text-white font-black text-xs uppercase tracking-wider">Promo Online Activa</span>
                  <span class="ml-auto bg-white/20 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Exclusivo Web</span>
                </div>
                <!-- Price area -->
                <div class="bg-emerald-50 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p class="text-[10px] text-emerald-600/70 font-bold uppercase tracking-tight">{{selectedPriceTier.sessions}} sesiones</p>
                    <div class="flex items-baseline gap-2 mt-0.5">
                      <span class="text-2xl font-black text-emerald-900">S/. {{selectedPriceTier.promo}}</span>
                      <span class="text-xs text-slate-400 line-through font-bold">S/. {{selectedPriceTier.regular}}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-emerald-600 font-black text-sm">-{{getSavingPercent(selectedPriceTier)}}%</p>
                    <p class="text-[9px] text-emerald-600/60 font-medium">ahorras S/. {{selectedPriceTier.regular - selectedPriceTier.promo}}</p>
                  </div>
                </div>
                <!-- Flow explanation -->
                <div class="bg-white px-4 py-3 flex items-start gap-3 border-t border-slate-100">
                  <div class="p-1.5 bg-slate-50 rounded-lg shrink-0 mt-0.5">
                    <svg class="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  </div>
                  <p class="text-[10px] text-slate-500 leading-relaxed">
                    <span class="font-bold text-slate-700 block">Proceso de pago</span>
                    Coordina tu cita aquí. Reciberás el link oficial de pago por WhatsApp al confirmar.
                  </p>
                </div>
              </div>
            </div>

            <!-- Date Selector -->
            <div class="relative group/sel">
              <label class="field-label flex justify-between">
                <span>Selecciona el Día</span>
                <span class="lowercase font-normal opacity-50">14 días disponibles</span>
              </label>
              <div class="relative flex items-center">
                <button type="button" (click)="scrollDates(-1)"
                  class="hidden md:flex absolute -left-3 z-10 w-7 h-7 bg-white shadow border border-slate-100 rounded-full items-center justify-center text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover/sel:opacity-100">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div #dateScroll class="flex gap-2 overflow-x-auto pb-3 pt-1 px-1 snap-x scroll-smooth no-scrollbar">
                  <button *ngFor="let day of availableDays" type="button" (click)="selectDate(day.date)"
                    [class]="selectedDate === day.date
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100 scale-105'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-300'"
                    class="flex-shrink-0 w-13 h-15 min-w-[52px] min-h-[60px] rounded-2xl border-2 flex flex-col items-center justify-center transition-all snap-center">
                    <span class="text-[9px] font-black uppercase opacity-60">{{day.weekday}}</span>
                    <span class="text-lg font-black leading-none mt-0.5">{{day.dayNumber}}</span>
                    <span class="text-[8px] opacity-40 mt-0.5">{{day.month}}</span>
                  </button>
                </div>
                <button type="button" (click)="scrollDates(1)"
                  class="hidden md:flex absolute -right-3 z-10 w-7 h-7 bg-white shadow border border-slate-100 rounded-full items-center justify-center text-slate-400 hover:text-emerald-600 transition-all opacity-0 group-hover/sel:opacity-100">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <!-- Time Slots -->
            <div *ngIf="selectedDate && booking.branchName">
              <label class="field-label mb-3">Elige tu Horario</label>
              <div *ngIf="hasAvailableSlots(); else noSlots" class="grid grid-cols-4 sm:grid-cols-5 gap-2">
                <button *ngFor="let slot of timeSlots" type="button"
                  (click)="slot.available && selectTime(slot.time)"
                  [disabled]="!slot.available"
                  [class]="selectedTime === slot.time && slot.available
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100'
                    : slot.available
                      ? 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 cursor-pointer'
                      : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through'"
                  class="py-3 rounded-xl text-xs font-bold border-2 text-center transition-all">
                  {{slot.time}}
                </button>
              </div>
              <ng-template #noSlots>
                <div class="p-6 bg-rose-50 border-2 border-dashed border-rose-100 rounded-2xl text-center">
                  <p class="text-rose-600 font-bold text-sm">Sin disponibilidad en esta sede para este día.</p>
                  <p class="text-rose-400 text-xs mt-1">Elige otra fecha o sede.</p>
                </div>
              </ng-template>
            </div>
            <div *ngIf="selectedDate && !booking.branchName" class="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 text-xs font-medium flex items-center gap-2">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              Selecciona una sede para ver los horarios disponibles.
            </div>

            <!-- Messages -->
            <div *ngIf="errorMessage" class="p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium border border-rose-100 flex items-center gap-2">
              <svg class="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              {{errorMessage}}
            </div>
            <div *ngIf="successMessage" class="p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium border border-emerald-100 flex items-center gap-2">
              <svg class="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              {{successMessage}}
            </div>

            <!-- Submit -->
            <button type="submit" [disabled]="isSubmitting || !isFormValid()"
              class="w-full bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 hover:bg-emerald-700 text-white font-black py-5 px-4 rounded-3xl shadow-2xl shadow-emerald-200 transition-all transform hover:-translate-y-0.5 active:scale-95 flex justify-center items-center gap-3 tracking-widest text-sm">
              <span *ngIf="!isSubmitting">CONTINUAR RESERVA</span>
              <span *ngIf="isSubmitting" class="animate-spin text-xl">🌀</span>
              <svg *ngIf="!isSubmitting" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
            </button>

          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .field-label { @apply block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2; }
    .field-input { @apply w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class BookingComponent implements OnInit {
  treatments: Treatment[] = [];
  branches: Branch[] = [];

  selectedTreatment: Treatment | undefined;
  selectedBranch: Branch | undefined;
  selectedPriceTier: TreatmentPrice | undefined;
  selectedDate = '';
  selectedTime = '';

  availableDays: { date: string; weekday: string; dayNumber: string; month: string }[] = [];
  timeSlots: { time: string; available: boolean }[] = [];

  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  booking = {
    name: '',
    whatsapp: '',
    treatment: '',
    branchName: '',
    sessions: 0
  };

  @ViewChild('dateScroll') dateScroll!: ElementRef;

  constructor(private settings: SettingsService) { }

  ngOnInit() {
    this.treatments = this.settings.getTreatments();
    this.branches = this.settings.getBranches();
    this.generateAvailableDays();
  }

  isFormValid(): boolean {
    return !!(
      this.booking.name.trim().length >= 3 &&
      this.booking.whatsapp.trim().length >= 7 &&
      this.booking.treatment &&
      this.booking.branchName &&
      this.booking.sessions > 0 &&
      this.selectedDate &&
      this.selectedTime
    );
  }

  hasAvailableSlots(): boolean {
    return this.timeSlots.some(s => s.available);
  }

  getSavingPercent(tier: TreatmentPrice): number {
    return Math.round((1 - tier.promo / tier.regular) * 100);
  }

  scrollDates(direction: number) {
    this.dateScroll?.nativeElement.scrollBy({ left: direction * 220, behavior: 'smooth' });
  }

  generateAvailableDays() {
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const days = [];
    const d = new Date();
    while (days.length < 14) {
      const clone = new Date(d);
      days.push({
        date: clone.toISOString().split('T')[0],
        weekday: weekdays[clone.getDay()],
        dayNumber: clone.getDate().toString(),
        month: months[clone.getMonth()]
      });
      d.setDate(d.getDate() + 1);
    }
    this.availableDays = days;
    if (!this.selectedDate) this.selectDate(days[0].date);
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.selectedTime = '';
    this.errorMessage = '';
    this.generateTimeSlots();
  }

  onTreatmentChange() {
    this.selectedTreatment = this.treatments.find(t => t.name === this.booking.treatment);
    this.selectedPriceTier = undefined;
    this.booking.sessions = 0;
  }

  onBranchChange() {
    this.selectedBranch = this.branches.find(b => b.name === this.booking.branchName);
    this.selectedTime = '';
    this.generateTimeSlots();
  }

  selectSessions(tier: TreatmentPrice) {
    this.selectedPriceTier = tier;
    this.booking.sessions = tier.sessions;
  }

  generateTimeSlots() {
    if (!this.selectedDate || !this.booking.branchName) {
      this.timeSlots = [];
      return;
    }
    const dayOfWeek = new Date(this.selectedDate + 'T12:00:00').getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const startHour = isWeekend ? 8 : 9;
    const endHour = 21;

    const hours: string[] = [];
    for (let h = startHour; h <= endHour; h++) {
      hours.push(`${h.toString().padStart(2, '0')}:00`);
    }

    this.timeSlots = hours.map(h => ({
      time: h,
      available: this.settings.isSlotAvailable(this.selectedDate, h, this.booking.branchName)
    }));
  }

  selectTime(time: string) {
    this.selectedTime = time;
    this.errorMessage = '';
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Completa todos los campos antes de continuar.';
      return;
    }
    if (!this.settings.isSlotAvailable(this.selectedDate, this.selectedTime, this.booking.branchName)) {
      this.errorMessage = 'Este horario ya fue reservado. Por favor elige otro.';
      this.generateTimeSlots();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    setTimeout(() => {
      const branch = this.settings.getBranchByName(this.booking.branchName)!;
      const appt: Appointment = {
        id: Date.now().toString(),
        patientName: this.booking.name.trim(),
        whatsapp: this.booking.whatsapp.trim(),
        treatment: this.booking.treatment,
        treatmentDescription: this.selectedTreatment?.description || '',
        sessions: this.booking.sessions,
        regularPrice: this.selectedPriceTier?.regular || 0,
        promoPrice: this.selectedPriceTier?.promo || 0,
        purchaseLink: this.selectedTreatment?.purchaseLink || '',
        branchName: branch.name,
        branchAddress: branch.address,
        date: this.selectedDate,
        time: this.selectedTime,
        status: 'Pending',
        sessionsUsed: 0,
        createdAt: new Date().toISOString()
      };

      this.settings.saveAppointment(appt);
      this.generateTimeSlots(); // block slot immediately

      const ownerPhone = this.settings.getOwnerPhone();
      const cleanDate = new Date(this.selectedDate + 'T12:00:00')
        .toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

      const lines = [
        'DEPILZONE',
        'Nueva Solicitud de Reserva',
        '---',
        `Cliente: ${appt.patientName}`,
        `WhatsApp: ${appt.whatsapp}`,
        `Tratamiento: ${appt.treatment}`,
        `Paquete: ${appt.sessions} sesiones`,
        `Precio promo: S/. ${appt.promoPrice}`,
        `Sede: ${appt.branchName}`,
        `Direccion: ${appt.branchAddress}`,
        `Fecha: ${cleanDate}`,
        `Hora: ${appt.time}`,
        '---',
        'Estado: Pendiente de confirmacion',
        '',
        `Link de pago: ${appt.purchaseLink}`
      ];
      const msg = encodeURIComponent(lines.join('\n'));

      this.successMessage = 'Solicitud enviada correctamente. Te contactaremos para confirmar.';

      setTimeout(() => {
        window.open(`https://wa.me/${ownerPhone}?text=${msg}`, '_blank');
        // Reset
        this.booking = { name: '', whatsapp: '', treatment: '', branchName: '', sessions: 0 };
        this.selectedTreatment = undefined;
        this.selectedBranch = undefined;
        this.selectedPriceTier = undefined;
        this.selectedDate = '';
        this.selectedTime = '';
        this.timeSlots = [];
        this.successMessage = '';
        this.isSubmitting = false;
        this.generateAvailableDays();
      }, 2000);
    }, 600);
  }
}
