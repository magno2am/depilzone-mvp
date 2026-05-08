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
        <h2 class="text-2xl font-bold text-slate-800">Configuración</h2>
        <p class="text-slate-500 text-sm">Número de notificaciones y catálogo de servicios.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- WhatsApp Owner -->
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-800">WhatsApp de Notificaciones</h3>
          </div>
          <label class="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Número del dueño</label>
          <div class="flex gap-2">
            <input type="text" [(ngModel)]="ownerPhone"
              class="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700"
              placeholder="51960227116">
            <button (click)="savePhone()" class="bg-slate-900 text-white px-5 rounded-xl font-bold hover:bg-black transition-colors text-sm">
              Guardar
            </button>
          </div>
          <p class="mt-2 text-[10px] text-slate-400">Formato: código de país + número sin espacios (ej. 51960123456)</p>
        </div>

        <!-- System Info -->
        <div class="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10">
            <h3 class="text-lg font-bold mb-0.5">DepilZone Smart-Manager</h3>
            <p class="text-white/60 text-xs mb-1">Sistema de Gestión de Citas</p>
            <p class="text-white/40 text-[10px] font-medium mb-6 uppercase tracking-wider">Versión Demo Operativa</p>
            <div class="space-y-2 text-sm text-white/80">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse"></span>
                Sistema operativo
              </div>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                4 sedes configuradas
              </div>
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                Almacenamiento local · Pendiente Supabase
              </div>
            </div>
          </div>
          <svg class="absolute -right-4 -bottom-4 text-white/10 w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </div>
      </div>

      <!-- Treatments Catalog -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Catálogo de Tratamientos</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div *ngFor="let t of treatments" class="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-sm transition-all">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black uppercase shrink-0">
                  {{t.name.substring(0,2)}}
                </div>
                <div>
                  <h4 class="font-bold text-slate-800 text-sm">{{t.name}}</h4>
                  <p class="text-[10px] text-slate-400 mt-0.5 max-w-[200px] leading-relaxed">{{t.description}}</p>
                </div>
              </div>
              <span class="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Activo</span>
            </div>

            <!-- Sessions pricing table -->
            <div class="space-y-1.5 mb-3">
              <div *ngFor="let p of t.prices" class="flex justify-between items-center bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                <span class="text-[10px] font-bold text-slate-500">{{p.sessions}} sesiones</span>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] text-slate-300 line-through font-bold">S/.{{p.regular}}</span>
                  <span class="text-xs font-black text-emerald-600">S/.{{p.promo}}</span>
                </div>
              </div>
            </div>

            <a [href]="t.purchaseLink" target="_blank"
              class="text-[10px] text-sky-600 font-bold hover:underline flex items-center gap-1">
              Ver en web
              <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Branches Info -->
      <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
        <div class="flex items-center gap-3 mb-6">
          <div class="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Sedes Activas</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div *ngFor="let b of branches" class="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span class="text-emerald-500 mt-0.5">📍</span>
            <div>
              <p class="font-bold text-slate-800 text-sm">{{b.name}}</p>
              <p class="text-xs text-slate-500 mt-0.5">{{b.address}}</p>
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
  branches: any[] = [];

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.ownerPhone = this.settings.getOwnerPhone();
    this.treatments = this.settings.getTreatments();
    this.branches = this.settings.getBranches();
  }

  savePhone() {
    if (!this.ownerPhone.trim()) return;
    this.settings.setOwnerPhone(this.ownerPhone);
    alert('✅ Número guardado correctamente.');
  }
}
