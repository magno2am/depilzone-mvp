import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <ng-container *ngIf="isBookingPage">
      <router-outlet></router-outlet>
    </ng-container>

    <div *ngIf="!isBookingPage" class="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-slate-200 shadow-sm z-10 hidden md:flex flex-col">
          <div class="h-16 flex items-center px-6 border-b border-slate-200">
            <div class="flex items-center gap-2 text-emerald-600 font-black text-xl">
              <div class="bg-emerald-100 p-1.5 rounded-lg flex items-center justify-center">
                <span class="text-emerald-700 text-xs">S/.</span>
              </div>
              DepilZone
            </div>
          </div>
        
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a routerLink="/admin" routerLinkActive="bg-emerald-50 text-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">Solicitudes</span>
          </a>

          <a routerLink="/dashboard" routerLinkActive="bg-emerald-50 text-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <span class="font-medium">Reportes</span>
          </a>
          
          <a routerLink="/calendar" routerLinkActive="bg-emerald-50 text-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span class="font-medium">Calendario</span>
          </a>

          <a routerLink="/settings" routerLinkActive="bg-emerald-50 text-emerald-600" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span class="font-medium">Configuración</span>
          </a>
        </nav>
        
        <div class="p-4 border-t border-slate-200">
          <div class="flex items-center gap-3 px-4 py-2">
            <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              DZ
            </div>
            <div class="text-sm">
              <p class="font-medium text-slate-900">Admin DepilZone</p>
              <p class="text-slate-500 text-xs">Gestión Remota</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative pb-16 md:pb-0">
        <!-- Top header -->
        <header class="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10 shrink-0">
          <h1 class="text-base md:text-xl font-semibold text-slate-800 truncate pr-4 uppercase tracking-wider">DepilZone Smart-Manager</h1>
          <div class="flex items-center gap-4">
            <button class="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        <!-- Page Content -->
        <div class="flex-1 overflow-auto p-4 md:p-8">
          <div class="max-w-7xl mx-auto pb-8 md:pb-0">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>

      <!-- Mobile Bottom Nav -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around h-16 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <a routerLink="/admin" routerLinkActive="text-emerald-600 font-bold" class="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors p-2 w-1/3 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          <span class="text-[10px] font-medium">Solicitudes</span>
        </a>
        <a routerLink="/dashboard" routerLinkActive="text-emerald-600 font-bold" class="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors p-2 w-1/3 text-center border-l border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
          <span class="text-[10px] font-medium">Reportes</span>
        </a>
        <a routerLink="/calendar" routerLinkActive="text-emerald-600 font-bold" class="flex flex-col items-center gap-1 text-slate-500 hover:text-emerald-600 transition-colors p-2 w-1/3 text-center border-l border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span class="text-[10px] font-medium">Calendario</span>
        </a>
      </nav>
    </div>
  `
})
export class AppComponent {
  isBookingPage = false;

  constructor(private router: Router) {
    console.log("SISTEMA DEPILZONE: Iniciando versión limpia sin datos demo.");
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isBookingPage = event.url === '/' || event.url === '/booking';
      }
    });
  }
}
