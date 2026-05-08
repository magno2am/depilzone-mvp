import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// ============================================================
// INTERFACES
// ============================================================

export interface TreatmentPrice {
  sessions: number;
  regular: number;
  promo: number;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  prices: TreatmentPrice[];
  purchaseLink: string;
  icon: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
}

/**
 * Stored statuses (persisted in localStorage).
 * Effective statuses (in_progress, completed) are COMPUTED at runtime.
 */
export type AppointmentStatus = 'Pending' | 'Scheduled' | 'Cancelled';

/**
 * Effective (display) status — computed from stored status + current time.
 */
export type EffectiveStatus = 'Pending' | 'Scheduled' | 'in_progress' | 'completed' | 'Cancelled';

export interface Appointment {
  id: string;
  patientName: string;
  whatsapp: string;
  treatment: string;
  treatmentDescription: string;
  sessions: number;          // total purchased sessions
  sessionsUsed: number;      // sessions already completed
  regularPrice: number;
  promoPrice: number;
  purchaseLink: string;
  branchName: string;
  branchAddress: string;
  date: string;              // 'YYYY-MM-DD'
  time: string;              // 'HH:MM'
  status: AppointmentStatus;
  createdAt: string;
}

/**
 * Client history record — aggregated view per whatsapp number.
 */
export interface ClientRecord {
  whatsapp: string;
  name: string;
  treatment: string;
  branchName: string;
  sessionsPurchased: number;
  sessionsUsed: number;
  sessionsRemaining: number;
  lastVisit: string | null;
  nextRecommendedSession: string | null;
  totalAppointments: number;
}

// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_TREATMENTS: Treatment[] = [
  {
    id: 'abdomen',
    name: 'Abdomen',
    description: 'Abarca desde el pliegue mamario hasta el inicio de pubis.',
    prices: [
      { sessions: 3, regular: 345, promo: 239 },
      { sessions: 6, regular: 690, promo: 324 },
      { sessions: 9, regular: 1035, promo: 441 },
      { sessions: 12, regular: 1380, promo: 588 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/abdomen/',
    icon: '✨'
  },
  {
    id: 'espalda',
    name: 'Espalda',
    description: 'Desde la zona cervical hasta el borde superior de los glúteos.',
    prices: [
      { sessions: 3, regular: 390, promo: 259 },
      { sessions: 6, regular: 780, promo: 384 },
      { sessions: 9, regular: 1170, promo: 531 },
      { sessions: 12, regular: 1560, promo: 708 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/espalda-hm/',
    icon: '👕'
  },
  {
    id: 'axilas',
    name: 'Axilas',
    description: 'Tratamiento completo para la zona de axilas.',
    prices: [
      { sessions: 3, regular: 240, promo: 159 },
      { sessions: 6, regular: 480, promo: 264 },
      { sessions: 9, regular: 720, promo: 369 },
      { sessions: 12, regular: 960, promo: 456 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/axilas/',
    icon: '💪'
  },
  {
    id: 'piernas',
    name: 'Piernas Completas',
    description: 'Incluye muslos, rodillas y pantorrillas.',
    prices: [
      { sessions: 3, regular: 540, promo: 369 },
      { sessions: 6, regular: 1080, promo: 594 },
      { sessions: 9, regular: 1620, promo: 819 },
      { sessions: 12, regular: 2160, promo: 1044 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/piernas-completas/',
    icon: '🦵'
  },
  {
    id: 'bikini',
    name: 'Bikini',
    description: 'Zona bikini clásica o brasileña.',
    prices: [
      { sessions: 3, regular: 270, promo: 189 },
      { sessions: 6, regular: 540, promo: 294 },
      { sessions: 9, regular: 810, promo: 399 },
      { sessions: 12, regular: 1080, promo: 504 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/bikini/',
    icon: '🌊'
  },
  {
    id: 'rostro',
    name: 'Rostro',
    description: 'Bozo, patillas, mentón y zonas faciales específicas.',
    prices: [
      { sessions: 3, regular: 180, promo: 129 },
      { sessions: 6, regular: 360, promo: 204 },
      { sessions: 9, regular: 540, promo: 279 },
      { sessions: 12, regular: 720, promo: 354 }
    ],
    purchaseLink: 'https://depilzone.com.pe/producto/rostro/',
    icon: '🫦'
  }
];

const DEFAULT_BRANCHES: Branch[] = [
  { id: 'surco', name: 'Surco', address: 'Av. Primavera 870, Surco' },
  { id: 'pueblo_libre', name: 'Pueblo Libre', address: 'Av. La Marina 1632, Pueblo Libre' },
  { id: 'independencia', name: 'Independencia', address: 'CC Mega Plaza, Independencia' },
  { id: 'izaguirre', name: 'Izaguirre / Los Olivos', address: 'Av. Carlos Izaguirre 556, Los Olivos' }
];

const STORAGE_KEY = 'depilzone_appointments';
const OWNER_PHONE_KEY = 'depilzone_owner_phone';
const TREATMENTS_KEY = 'depilzone_treatments';

// ============================================================
// SERVICE
// ============================================================

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly defaultOwnerPhone = '51960227116';
  private readonly branches: Branch[] = DEFAULT_BRANCHES;

  private appointmentsSubject = new BehaviorSubject<Appointment[]>(this.loadFromStorage());

  // ---- REACTIVE STREAM ----

  getAppointments$(): Observable<Appointment[]> {
    return this.appointmentsSubject.asObservable();
  }

  private loadFromStorage(): Appointment[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(a => ({ sessionsUsed: 0, ...a })) : [];
    } catch {
      return [];
    }
  }

  private persist(appointments: Appointment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    this.appointmentsSubject.next(appointments);
  }

  // ---- APPOINTMENTS CRUD ----

  getAppointments(): Appointment[] {
    return this.loadFromStorage();
  }

  saveAppointment(appt: Appointment): void {
    const all = this.loadFromStorage();
    const idx = all.findIndex(a => a.id === appt.id);
    if (idx !== -1) {
      all[idx] = appt;
    } else {
      all.push(appt);
    }
    this.persist(all);
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    const all = this.loadFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], status };
      this.persist(all);
    }
  }

  deleteAppointment(id: string): void {
    this.persist(this.loadFromStorage().filter(a => a.id !== id));
  }

  /**
   * Complete a session: mark confirmed, increment sessionsUsed.
   * Computes nextRecommendedSession (date + 45 days) stored on appointment.
   */
  completeSession(id: string): void {
    const all = this.loadFromStorage();
    const idx = all.findIndex(a => a.id === id);
    if (idx === -1) return;
    const appt = all[idx];
    all[idx] = {
      ...appt,
      status: 'Scheduled',
      sessionsUsed: (appt.sessionsUsed || 0) + 1
    };
    this.persist(all);
  }

  // ---- EFFECTIVE STATUS (computed, not stored) ----

  /**
   * Computes runtime display status based on stored status + current time.
   * Stored statuses: Pending, Scheduled, Cancelled
   * Runtime additions: in_progress, completed
   */
  computeEffectiveStatus(appt: Appointment): EffectiveStatus {
    if (appt.status === 'Cancelled') return 'Cancelled';
    if (appt.status === 'Pending') return 'Pending';

    const now = new Date();
    const apptStart = new Date(`${appt.date}T${appt.time}:00`);
    const apptEnd = new Date(apptStart.getTime() + 45 * 60 * 1000); // 45 min session

    if (now >= apptStart && now < apptEnd) return 'in_progress';
    if (now >= apptEnd) return 'completed';
    return 'Scheduled';
  }

  // ---- AVAILABILITY ----

  isSlotAvailable(date: string, time: string, branchName: string): boolean {
    const blocked: AppointmentStatus[] = ['Pending', 'Scheduled'];
    return !this.loadFromStorage().some(a =>
      a.date === date &&
      a.time === time &&
      a.branchName === branchName &&
      blocked.includes(a.status)
    );
  }

  /** Check for duplicate: same date + time + branch (excluding a specific id) */
  isDuplicate(date: string, time: string, branchName: string, excludeId?: string): boolean {
    return this.loadFromStorage().some(a =>
      a.id !== excludeId &&
      a.date === date &&
      a.time === time &&
      a.branchName === branchName &&
      a.status !== 'Cancelled'
    );
  }

  // ---- CLIENT HISTORY ----

  /**
   * Aggregates all appointments per client (grouped by whatsapp).
   */
  getClientHistory(): ClientRecord[] {
    const appts = this.loadFromStorage();
    const map = new Map<string, ClientRecord>();

    for (const a of appts) {
      const key = a.whatsapp || a.patientName;
      const effective = this.computeEffectiveStatus(a);
      const isCompleted = effective === 'completed' || effective === 'in_progress';

      if (!map.has(key)) {
        map.set(key, {
          whatsapp: a.whatsapp,
          name: a.patientName,
          treatment: a.treatment,
          branchName: a.branchName,
          sessionsPurchased: a.sessions || 0,
          sessionsUsed: isCompleted ? 1 : 0,
          sessionsRemaining: 0,
          lastVisit: isCompleted ? a.date : null,
          nextRecommendedSession: null,
          totalAppointments: 1
        });
      } else {
        const rec = map.get(key)!;
        rec.totalAppointments++;
        if (isCompleted) {
          rec.sessionsUsed++;
          if (!rec.lastVisit || a.date > rec.lastVisit) rec.lastVisit = a.date;
        }
      }
    }

    // Compute sessions remaining and next recommended date
    map.forEach(rec => {
      rec.sessionsRemaining = Math.max(0, rec.sessionsPurchased - rec.sessionsUsed);
      if (rec.lastVisit) {
        const d = new Date(rec.lastVisit + 'T12:00:00');
        d.setDate(d.getDate() + 45);
        rec.nextRecommendedSession = d.toISOString().split('T')[0];
      }
    });

    return Array.from(map.values());
  }

  // ---- ANALYTICS HELPERS ----

  getTopTreatment(): { name: string; count: number } | null {
    const active = this.loadFromStorage().filter(a => a.status !== 'Cancelled');
    if (!active.length) return null;
    const map: Record<string, number> = {};
    active.forEach(a => map[a.treatment] = (map[a.treatment] || 0) + 1);
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return { name: top[0], count: top[1] };
  }

  getTopBranch(): { name: string; count: number } | null {
    const active = this.loadFromStorage().filter(a => a.status !== 'Cancelled');
    if (!active.length) return null;
    const map: Record<string, number> = {};
    active.forEach(a => map[a.branchName] = (map[a.branchName] || 0) + 1);
    const top = Object.entries(map).sort((a, b) => b[1] - a[1])[0];
    return { name: top[0], count: top[1] };
  }

  getDailyOccupancy(): Record<string, number> {
    const map: Record<string, number> = {};
    this.loadFromStorage()
      .filter(a => a.status !== 'Cancelled')
      .forEach(a => map[a.date] = (map[a.date] || 0) + 1);
    return map;
  }

  // ---- TREATMENTS ----

  getTreatments(): Treatment[] {
    try {
      const saved = localStorage.getItem(TREATMENTS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_TREATMENTS;
    } catch {
      return DEFAULT_TREATMENTS;
    }
  }

  saveTreatments(treatments: Treatment[]): void {
    localStorage.setItem(TREATMENTS_KEY, JSON.stringify(treatments));
  }

  // ---- BRANCHES ----

  getBranches(): Branch[] { return this.branches; }

  getBranchByName(name: string): Branch | undefined {
    return this.branches.find(b => b.name === name);
  }

  // ---- OWNER PHONE ----

  getOwnerPhone(): string {
    return localStorage.getItem(OWNER_PHONE_KEY) || this.defaultOwnerPhone;
  }

  setOwnerPhone(phone: string): void {
    localStorage.setItem(OWNER_PHONE_KEY, phone.trim());
  }
}
