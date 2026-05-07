import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, Treatment } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 class="text-3xl font-black text-slate-800 tracking-tight">Configuración</h2>
        <p class="text-slate-500">Personaliza tu catálogo de servicios y datos de contacto.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Contact Settings -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800">Contacto del Dueño</h3>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp de Notificaciones</label>
              <div class="flex gap-2">
                <input type="text" [(ngModel)]="ownerPhone" class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all">
                <button (click)="savePhone()" class="bg-slate-900 text-white px-6 rounded-xl font-bold hover:bg-black transition-colors">Guardar</button>
              </div>
              <p class="mt-2 text-[10px] text-slate-400">Formato: Código país + número (ej. 51960227116)</p>
            </div>
          </div>
        </div>

        <!-- System Info -->
        <div class="bg-gradient-to-br from-emerald-500 to-sky-500 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-xl font-bold mb-2">DepilZone Smart-Manager</h3>
            <p class="text-white/80 text-sm mb-6">Versión 1.2.0 - Edición Especial MVP</p>
            <div class="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <span class="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></span>
              Sistema Operativo
            </div>
          </div>
          <svg class="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </div>

      </div>

      <!-- Treatments Management -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div class="flex items-center gap-3 mb-8">
          <div class="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800">Catálogo de Tratamientos y Precios</h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let t of treatments" class="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
            <div class="flex items-center justify-between mb-4">
              <span class="text-3xl">{{t.icon}}</span>
              <span class="text-[10px] font-black bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg uppercase">Activo</span>
            </div>
            <h4 class="font-bold text-slate-800 mb-1">{{t.name}}</h4>
            <div class="mt-4 flex items-end gap-2">
              <div class="flex-1">
                <label class="text-[10px] font-bold text-slate-400 uppercase">Precio (S/.)</label>
                <input type="number" [(ngModel)]="t.price" (change)="saveTreatment(t)" class="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  ownerPhone = '';
  treatments: Treatment[] = [];

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.ownerPhone = this.settings.getOwnerPhone();
    this.treatments = this.settings.getTreatments();
  }

  savePhone() {
    this.settings.setOwnerPhone(this.ownerPhone);
    alert('Teléfono actualizado correctamente.');
  }

  saveTreatment(t: Treatment) {
    this.settings.updateTreatmentPrice(t.id, t.price);
    // Silent save or toast
  }
}
