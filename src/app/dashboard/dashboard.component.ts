import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsService, Appointment, EffectiveStatus } from '../services/settings.service';
import { Subscription } from 'rxjs';

declare var google: any;

interface DayHour { hour: string; count: number; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">

      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Panel de Control</h2>
          <p class="text-slate-400 text-sm">{{today}}</p>
        </div>
        <button (click)="sendReport()"
          class="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-sm transition-all">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
          Enviar Reporte
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Total activas</p>
          <p class="text-3xl font-black text-slate-800">{{totalActive}}</p>
          <p class="text-[10px] text-slate-400 mt-1">sin canceladas</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Completadas</p>
          <p class="text-3xl font-black text-emerald-600">{{completedCount}}</p>
          <p class="text-[10px] text-slate-400 mt-1">históricas</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Pendientes</p>
          <p class="text-3xl font-black text-amber-500">{{pendingCount}}</p>
          <p class="text-[10px] text-slate-400 mt-1">por confirmar</p>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow bg-emerald-50/30">
          <p class="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">Ingresos promo</p>
          <p class="text-2xl font-black text-emerald-700">S/. {{revenue}}</p>
          <p class="text-[10px] text-emerald-500 mt-1">citas confirmadas</p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-3 bg-teal-50 rounded-xl shrink-0">
            <svg class="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Tratamiento top</p>
            <p class="font-bold text-slate-800 mt-0.5">{{topTreatment?.name || '—'}}</p>
            <p class="text-[10px] text-slate-400">{{topTreatment?.count || 0}} citas</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-3 bg-sky-50 rounded-xl shrink-0">
            <svg class="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Sede con más citas</p>
            <p class="font-bold text-slate-800 mt-0.5">{{topBranch?.name || '—'}}</p>
            <p class="text-[10px] text-slate-400">{{topBranch?.count || 0}} citas</p>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="p-3 bg-rose-50 rounded-xl shrink-0">
            <svg class="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Canceladas</p>
            <p class="font-bold text-slate-800 mt-0.5">{{cancelledCount}}</p>
            <p class="text-[10px] text-slate-400">total histórico</p>
          </div>
        </div>
      </div>

      <!-- Charts or Empty -->
      <ng-container *ngIf="appointments.length > 0; else emptyState">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Por Tratamiento</h3>
            <div id="piechart" class="w-full h-64"></div>
          </div>
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Por Sede</h3>
            <div id="branchchart" class="w-full h-64"></div>
          </div>
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 lg:col-span-2">
            <h3 class="text-sm font-bold text-slate-700 uppercase tracking-wider mb-5">Flujo por Hora — Hoy</h3>
            <div id="hourchart" class="w-full h-52"></div>
          </div>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div class="bg-white rounded-3xl p-20 border border-slate-100 flex flex-col items-center text-center">
          <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <svg class="h-7 w-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <h3 class="text-lg font-bold text-slate-700 mb-1">Sin datos aún</h3>
          <p class="text-slate-400 text-sm">Los gráficos se generarán cuando se registren citas.</p>
        </div>
      </ng-template>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  appointments: Appointment[] = [];
  today = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  totalActive = 0;
  completedCount = 0;
  pendingCount = 0;
  cancelledCount = 0;
  revenue = 0;
  topTreatment: { name: string; count: number } | null = null;
  topBranch: { name: string; count: number } | null = null;

  private sub!: Subscription;
  private chartsReady = false;

  constructor(private settings: SettingsService) {}

  ngOnInit() {
    this.sub = this.settings.getAppointments$().subscribe(data => {
      this.appointments = data;
      this.computeMetrics();
      if (this.chartsReady && data.length > 0) setTimeout(() => this.drawCharts(), 50);
    });
  }

  ngAfterViewInit() {
    const load = () => {
      if (typeof google !== 'undefined' && google.charts) {
        google.charts.load('current', { packages: ['corechart'] });
        google.charts.setOnLoadCallback(() => {
          this.chartsReady = true;
          if (this.appointments.length > 0) this.drawCharts();
        });
      } else {
        setTimeout(load, 1500);
      }
    };
    load();
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  computeMetrics() {
    const all = this.appointments;
    const active = all.filter(a => a.status !== 'Cancelled');

    this.totalActive = active.length;
    this.cancelledCount = all.filter(a => a.status === 'Cancelled').length;
    this.pendingCount = all.filter(a => a.status === 'Pending').length;

    // Completed: effective status = completed (past scheduled appointments)
    this.completedCount = active.filter(a => {
      const eff = this.settings.computeEffectiveStatus(a);
      return eff === 'completed';
    }).length;

    // Revenue: confirmed (Scheduled) appointments only
    this.revenue = active
      .filter(a => a.status === 'Scheduled')
      .reduce((sum, a) => sum + (a.promoPrice || 0), 0);

    this.topTreatment = this.settings.getTopTreatment();
    this.topBranch = this.settings.getTopBranch();
  }

  drawCharts() {
    if (!this.chartsReady || !document.getElementById('piechart')) return;
    const active = this.appointments.filter(a => a.status !== 'Cancelled');
    const fontName = 'Inter, sans-serif';
    const chartColors = ['#0d9488', '#0284c7', '#7c3aed', '#d97706', '#e11d48', '#16a34a'];

    // Treatment pie
    const treatMap: Record<string, number> = {};
    active.forEach(a => treatMap[a.treatment] = (treatMap[a.treatment] || 0) + 1);
    if (Object.keys(treatMap).length && document.getElementById('piechart')) {
      const data = google.visualization.arrayToDataTable([
        ['Tratamiento', 'Citas'], ...Object.entries(treatMap)
      ]);
      new google.visualization.PieChart(document.getElementById('piechart')).draw(data, {
        pieHole: 0.55, colors: chartColors,
        chartArea: { width: '92%', height: '85%' },
        legend: { position: 'bottom', textStyle: { fontSize: 10, color: '#64748b', fontName } },
        backgroundColor: 'transparent',
        animation: { startup: true, duration: 500 }
      });
    }

    // Branch column
    const branchMap: Record<string, number> = {};
    active.forEach(a => branchMap[a.branchName] = (branchMap[a.branchName] || 0) + 1);
    if (Object.keys(branchMap).length && document.getElementById('branchchart')) {
      const data = google.visualization.arrayToDataTable([
        ['Sede', 'Citas', { role: 'style' }],
        ...Object.entries(branchMap).map(([k, v]) => [k, v, 'color: #0d9488'])
      ]);
      new google.visualization.ColumnChart(document.getElementById('branchchart')).draw(data, {
        chartArea: { width: '80%', height: '72%' }, legend: { position: 'none' },
        hAxis: { textStyle: { fontSize: 9, color: '#94a3b8', fontName } },
        vAxis: { minValue: 0, format: '0', gridlines: { color: '#f1f5f9' }, textStyle: { fontSize: 9, color: '#94a3b8' } },
        backgroundColor: 'transparent',
        animation: { startup: true, duration: 500 }
      });
    }

    // Hourly flow — today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAppts = this.appointments.filter(a => a.date === todayStr && a.status !== 'Cancelled');
    const hours = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];
    const hourMap: Record<string, number> = {};
    hours.forEach(h => hourMap[h] = 0);
    todayAppts.forEach(a => { if (hourMap[a.time] !== undefined) hourMap[a.time]++; });
    if (document.getElementById('hourchart')) {
      const data = google.visualization.arrayToDataTable([
        ['Hora', 'Citas', { role: 'style' }],
        ...hours.map(h => [h, hourMap[h], `color: ${hourMap[h] > 0 ? '#0d9488' : '#e2e8f0'}`])
      ]);
      new google.visualization.ColumnChart(document.getElementById('hourchart')).draw(data, {
        chartArea: { width: '92%', height: '72%' }, legend: { position: 'none' },
        hAxis: { textStyle: { fontSize: 8, color: '#94a3b8', fontName }, slantedText: true, slantedTextAngle: 45 },
        vAxis: { minValue: 0, format: '0', gridlines: { color: '#f1f5f9' } },
        backgroundColor: 'transparent',
        animation: { startup: true, duration: 500 }
      });
    }
  }

  sendReport() {
    const ownerPhone = this.settings.getOwnerPhone();
    const lines = [
      'REPORTE DIARIO — DEPILZONE',
      `Fecha: ${this.today}`,
      '',
      `Citas activas: ${this.totalActive}`,
      `Completadas: ${this.completedCount}`,
      `Pendientes de confirmacion: ${this.pendingCount}`,
      `Canceladas: ${this.cancelledCount}`,
      `Ingresos promo (confirmadas): S/. ${this.revenue}`,
      '',
      `Tratamiento mas solicitado: ${this.topTreatment?.name || 'N/A'} (${this.topTreatment?.count || 0})`,
      `Sede con mas actividad: ${this.topBranch?.name || 'N/A'} (${this.topBranch?.count || 0})`,
      '',
      'Generado por DepilZone Smart-Manager'
    ];
    window.open(`https://wa.me/${ownerPhone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  }
}
