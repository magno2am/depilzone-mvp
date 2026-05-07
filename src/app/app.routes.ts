import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CalendarComponent } from './calendar/calendar.component';
import { BookingComponent } from './booking/booking.component';
import { AdminDashboardComponent } from './admin/admin.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', component: BookingComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
