export interface AdminSystemSettings {
  showCoachNumbersOnMainPage: boolean; // User requested: toggle display of coach numbers on main page
  startingCounter: string;            // Locked to "Mirpur-10"
  dateFormat: 'DD-MM-YYYY';           // User requested: Date-Month-Year format
  enableOnlineBookingSync: boolean;
  enableSoundAlerts: boolean;
  autoRefreshIntervalSeconds: number;
  maintenanceMode: boolean;
}

const STORAGE_KEY = 'lsp_admin_system_settings_v1';

export const DEFAULT_ADMIN_SETTINGS: AdminSystemSettings = {
  showCoachNumbersOnMainPage: true,
  startingCounter: 'Mirpur-10',
  dateFormat: 'DD-MM-YYYY',
  enableOnlineBookingSync: true,
  enableSoundAlerts: true,
  autoRefreshIntervalSeconds: 15,
  maintenanceMode: false,
};

class AdminSettingsService {
  private settings: AdminSystemSettings = DEFAULT_ADMIN_SETTINGS;
  private listeners: Array<(settings: AdminSystemSettings) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.settings = { 
          ...DEFAULT_ADMIN_SETTINGS, 
          ...JSON.parse(saved),
          startingCounter: 'Mirpur-10', // Strictly enforce locked Mirpur-10
          dateFormat: 'DD-MM-YYYY',     // Strictly enforce Date-Month-Year
        };
      }
    } catch (e) {
      console.warn('Could not read admin settings from storage:', e);
    }
  }

  public getSettings(): AdminSystemSettings {
    return { ...this.settings, startingCounter: 'Mirpur-10', dateFormat: 'DD-MM-YYYY' };
  }

  public updateSettings(updates: Partial<AdminSystemSettings>) {
    this.settings = { 
      ...this.settings, 
      ...updates,
      startingCounter: 'Mirpur-10', // Locked to Mirpur-10
      dateFormat: 'DD-MM-YYYY',     // Locked to Date-Month-Year
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save admin settings:', e);
    }
    this.notify();
  }

  public toggleCoachNumbers() {
    this.updateSettings({
      showCoachNumbersOnMainPage: !this.settings.showCoachNumbersOnMainPage,
    });
  }

  public subscribe(callback: (settings: AdminSystemSettings) => void): () => void {
    this.listeners.push(callback);
    callback(this.getSettings());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const current = this.getSettings();
    this.listeners.forEach((cb) => {
      try {
        cb(current);
      } catch (err) {
        console.error('Error in admin settings listener:', err);
      }
    });
  }
}

export const adminSettingsService = new AdminSettingsService();
