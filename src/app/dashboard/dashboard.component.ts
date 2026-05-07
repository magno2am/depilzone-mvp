import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, DashboardStatsDto } from '../services/api.service';

declare var google: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Reportes y Métricas</h2>
          <p class="text-slate-500">Visualización de rendimiento y estado del negocio.</p>
        </div>
        <button (click)="enviarReporteWhatsapp()" class="bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transition-all duration-300 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-emerald-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          Enviar Reporte al Dueño
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 text-slate-500 mb-4">
            <div class="p-2 bg-sky-50 text-sky-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <span class="font-medium text-sm">Citas Totales</span>
          </div>
          <div class="text-3xl font-bold text-slate-800">{{ totalAppointments }}</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 text-slate-500 mb-4">
            <div class="p-2 bg-emerald-50 text-emerald-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span class="font-medium text-sm">Confirmadas</span>
          </div>
          <div class="text-3xl font-bold text-slate-800">{{ confirmedCount }}</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 text-slate-500 mb-4">
            <div class="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" /></svg>
            </div>
            <span class="font-medium text-sm">Pendientes</span>
          </div>
          <div class="text-3xl font-bold text-slate-800">{{ pendingCount }}</div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow">
          <div class="flex items-center gap-3 text-slate-500 mb-4">
            <div class="p-2 bg-violet-50 text-violet-500 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span class="font-medium text-sm">Ingresos Estimados</span>
          </div>
          <div class="text-3xl font-bold text-slate-800">S/. {{ estimatedRevenue }}</div>
        </div>
      </div>

      <!-- Charts Area -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span class="w-2 h-6 bg-emerald-500 rounded-full"></span>
            Distribución por Tratamiento
          </h3>
          <div id="piechart" class="w-full h-80 flex items-center justify-center text-slate-400">
            <div class="animate-pulse flex gap-2"><div class="w-2 h-2 bg-slate-300 rounded-full"></div><div class="w-2 h-2 bg-slate-300 rounded-full"></div><div class="w-2 h-2 bg-slate-300 rounded-full"></div></div>
          </div>
        </div>
        
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all">
          <h3 class="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span class="w-2 h-6 bg-sky-500 rounded-full"></span>
            Flujo de Citas del Día
          </h3>
          <div id="columnchart" class="w-full h-80 flex items-center justify-center text-slate-400">
            <div class="animate-pulse flex gap-2"><div class="w-2 h-2 bg-slate-300 rounded-full"></div><div class="w-2 h-2 bg-slate-300 rounded-full"></div><div class="w-2 h-2 bg-slate-300 rounded-full"></div></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, AfterViewInit {
  totalAppointments = 0;
  confirmedCount = 0;
  pendingCount = 0;
  estimatedRevenue = 0;
  
  appointments: any[] = [];
  pendingRequests: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getAppointments().subscribe(apiData => {
      // apiData ya contiene la información unificada desde el servicio
      this.appointments = apiData;
      
      this.totalAppointments = this.appointments.length;
      this.confirmedCount = this.appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Completed').length;
      this.pendingCount = this.appointments.filter(a => a.status === 'Pending' || (a.status as any) === 'PENDIENTE').length;
      
      // Calcular ingresos reales basados en el precio de cada cita
      this.estimatedRevenue = this.appointments
        .filter(a => a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Completed')
        .reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

      if (typeof google !== 'undefined' && google.charts && google.charts.visualizations) {
        this.drawCharts();
      }
    });
  }

  enviarReporteWhatsapp() {
    const text = `*SISTEMA DE GESTIÓN | DEPILZONE*%0A%0A¡Hola! Aquí está el reporte actualizado:%0A📊 Citas Totales: ${this.totalAppointments}%0A✅ Confirmadas: ${this.confirmedCount}%0A⏳ Pendientes: ${this.pendingCount}%0A💰 Ingresos Estimados: S/. ${this.estimatedRevenue}`;
    window.open(`https://wa.me/51960227116?text=${text}`, '_blank');
  }

  ngAfterViewInit() {
    if (typeof google !== 'undefined' && google.charts) {
      google.charts.load('current', { 'packages': ['corechart'] });
      google.charts.setOnLoadCallback(() => this.drawCharts());
    } else {
      setTimeout(() => {
        if (typeof google !== 'undefined' && google.charts) {
          google.charts.load('current', { 'packages': ['corechart'] });
          google.charts.setOnLoadCallback(() => this.drawCharts());
        }
      }, 1000);
    }
  }

  drawCharts() {
    if (!document.getElementById('piechart')) return;

    // Treatment Data logic
    const treatmentMap: any = {};
    [...this.appointments, ...this.pendingRequests].forEach(a => {
      const t = a.treatment || 'Otros';
      treatmentMap[t] = (treatmentMap[t] || 0) + 1;
    });

    const pieDataArray = [['Tratamiento', 'Citas']];
    for (const key in treatmentMap) {
      pieDataArray.push([key, treatmentMap[key]]);
    }

    const pieData = google.visualization.arrayToDataTable(pieDataArray);
    const pieOptions = {
      pieHole: 0.4,
      colors: ['#0ea5e9', '#8b5cf6', '#10b981', '#f43f5e', '#f97316'],
      chartArea: { width: '90%', height: '80%' },
      legend: { position: 'bottom' },
      backgroundColor: 'transparent'
    };

    const pieChart = new google.visualization.PieChart(document.getElementById('piechart'));
    pieChart.draw(pieData, pieOptions);

    // Occupation logic (simplified for today)
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const colDataArray: any[] = [['Hora', 'Citas']];
    
    hours.forEach(h => {
      const count = this.appointments.filter(a => (a.startTime || '').includes(h)).length;
      colDataArray.push([h, count]);
    });

    const colData = google.visualization.arrayToDataTable(colDataArray);
    const colOptions = {
      colors: ['#0ea5e9'],
      chartArea: { width: '80%', height: '70%' },
      legend: { position: 'none' },
      vAxis: { minValue: 0, format: '0' },
      backgroundColor: 'transparent'
    };

    const colChart = new google.visualization.ColumnChart(document.getElementById('columnchart'));
    colChart.draw(colData, colOptions);
  }
}
