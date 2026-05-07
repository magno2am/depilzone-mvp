import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Treatment } from '../services/settings.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <div class="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        <!-- Left Side: Branding & Info -->
        <div class="bg-primary p-10 text-white relative flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-600 to-sky-500 opacity-90"></div>
          <div class="relative z-10">
            <div class="flex items-center gap-3 mb-8">
              <div class="bg-white/20 p-2 rounded-xl backdrop-blur-md flex items-center justify-center min-w-[40px]">
                <span class="text-white font-bold text-lg">S/.</span>
              </div>
              <h1 class="text-3xl font-bold tracking-tighter uppercase">DEPILZONE</h1>
            </div>
            
            <h2 class="text-4xl font-extrabold leading-tight mb-6">Piel suave, <br>confianza infinita.</h2>
            
            <div class="space-y-4 text-emerald-50">
              <div class="flex items-center gap-3">
                <span class="p-1 bg-emerald-400/30 rounded-full">✅</span>
                <p>Tecnología Láser de última generación</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="p-1 bg-emerald-400/30 rounded-full">✅</span>
                <p>Resultados visibles desde la 1ra sesión</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="p-1 bg-emerald-400/30 rounded-full">✅</span>
                <p>Atención personalizada y segura</p>
              </div>
            </div>
          </div>
          
          <div class="relative z-10 mt-12 p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-sm">
            <p class="font-medium">📍 Ubicación:</p>
            <p class="opacity-80">Av. Principal 123, Lima, Perú</p>
          </div>
        </div>

        <!-- Right Side: Form -->
        <div class="p-8 md:p-12">
          <div class="mb-8">
            <h3 class="text-2xl font-bold text-slate-800">Reserva tu Cita</h3>
            <p class="text-slate-500">Completa tus datos y nos pondremos en contacto.</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Nombre Completo</label>
              <input type="text" [(ngModel)]="booking.name" name="name" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-slate-400" placeholder="Ej. María Sánchez">
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp</label>
                <input type="tel" [(ngModel)]="booking.whatsapp" name="whatsapp" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-slate-400" placeholder="+51...">
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Tratamiento</label>
                <select [(ngModel)]="booking.treatment" name="treatment" (change)="updateSelectedTreatment()" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-700">
                  <option *ngFor="let t of treatments" [value]="t.name">{{t.icon}} {{t.name}}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">1. Selecciona el Día</label>
              <div class="flex gap-2 overflow-x-auto pb-4 no-scrollbar snap-x">
                <button *ngFor="let day of availableDays" 
                        type="button"
                        (click)="selectDate(day.date)"
                        [ngClass]="{
                          'bg-emerald-500 text-white shadow-md shadow-emerald-100 border-emerald-500': selectedDate === day.date,
                          'bg-white text-slate-600 border-slate-100 hover:border-emerald-200': selectedDate !== day.date
                        }"
                        class="flex-shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all snap-center">
                  <span class="text-[10px] font-bold uppercase opacity-60">{{day.weekday}}</span>
                  <span class="text-xl font-black">{{day.dayNumber}}</span>
                </button>
              </div>
            </div>

            <div *ngIf="selectedDate">
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">2. Elige tu Horario</label>
              <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <button *ngFor="let slot of timeSlots" 
                        type="button"
                        (click)="selectTime(slot.time)"
                        [disabled]="!slot.available"
                        [ngClass]="{
                          'bg-emerald-500 text-white shadow-lg shadow-emerald-100': booking.datetime.includes(slot.time) && slot.available,
                          'bg-slate-50 text-slate-700 hover:bg-slate-100': !booking.datetime.includes(slot.time) && slot.available,
                          'bg-rose-50 text-rose-300 cursor-not-allowed border-rose-100 line-through': !slot.available
                        }"
                        class="px-2 py-3 rounded-xl text-xs font-bold transition-all border border-slate-100">
                  {{slot.time}}
                  <span *ngIf="!slot.available" class="block text-[8px] uppercase">Ocupado</span>
                </button>
              </div>
            </div>

            <div *ngIf="selectedTreatment" class="p-4 bg-emerald-50 rounded-2xl flex justify-between items-center border border-emerald-100">
              <span class="text-emerald-700 font-medium">Inversión estimada:</span>
              <span class="text-2xl font-black text-emerald-600">S/. {{selectedTreatment.price}}</span>
            </div>

            <button type="submit" [disabled]="!booking.datetime" class="w-full bg-slate-900 disabled:bg-slate-300 hover:bg-black text-white font-bold py-4 px-4 rounded-2xl shadow-xl transition-all transform hover:-translate-y-1 mt-6 flex justify-center items-center gap-2">
              <span>CONFIRMAR RESERVA</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class BookingComponent implements OnInit {
  treatments: Treatment[] = [];
  selectedTreatment?: Treatment;
  selectedDate: string = '';
  selectedTime: string = '';
  availableDays: { date: string, weekday: string, dayNumber: string }[] = [];
  timeSlots: { time: string, available: boolean }[] = [];

  booking = {
    name: '',
    whatsapp: '',
    treatment: '',
    datetime: ''
  };

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.treatments = this.settings.getTreatments();
    this.booking.treatment = this.treatments[0].name;
    this.updateSelectedTreatment();
    this.generateAvailableDays();
  }

  generateAvailableDays() {
    const days = [];
    const now = new Date();
    const weekdays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // No agendar domingos (opcional, pero común)
      if (date.getDay() === 0) continue;

      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        weekday: weekdays[date.getDay()],
        dayNumber: date.getDate().toString()
      });
    }
    this.availableDays = days;
    
    // Pre-seleccionar el primer día disponible
    if (this.availableDays.length > 0) {
      this.selectDate(this.availableDays[0].date);
    }
  }

  selectDate(date: string) {
    this.selectedDate = date;
    this.generateTimeSlots();
  }

  updateSelectedTreatment() {
    this.selectedTreatment = this.treatments.find(t => t.name === this.booking.treatment);
  }

  generateTimeSlots() {
    if (!this.selectedDate) return;
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    this.timeSlots = hours.map(h => {
      return {
        time: h,
        available: !this.settings.isTimeBooked(this.selectedDate, h)
      };
    });
  }

  selectTime(time: string) {
    this.booking.datetime = `${this.selectedDate}T${time}`;
    this.selectedTime = time;
  }

  onSubmit() {
    if (!this.booking.name || !this.selectedDate || !this.selectedTime) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    if (this.settings.isTimeBooked(this.selectedDate, this.selectedTime)) {
      alert('Lo sentimos, este horario ya está reservado.');
      this.generateTimeSlots();
      return;
    }

    // PASO 3: Guardar cita unificada
    const appt = {
      id: Date.now().toString(),
      patientName: this.booking.name,
      whatsapp: this.booking.whatsapp,
      treatment: this.booking.treatment,
      date: this.selectedDate,
      time: this.selectedTime,
      status: 'Pending',
      price: this.selectedTreatment?.price || 0
    };

    this.settings.saveAppointment(appt);

    const ownerPhone = '51960227116';
    const msg = `🔔 Nueva solicitud de cita: ${this.booking.name} para ${this.booking.treatment} el ${this.selectedDate} a las ${this.selectedTime}. Revisar aquí: http://localhost:4200/dashboard`;
    
    window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    
    alert('¡Cita solicitada! Horario bloqueado.');
    this.booking = { name: '', whatsapp: '', treatment: this.treatments[0].name, datetime: '' };
    this.selectedDate = '';
    this.selectedTime = '';
    this.timeSlots = [];
    this.updateSelectedTreatment();
  }
}
