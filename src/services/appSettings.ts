/**
 * Application Settings Service: Manages admin preferences, coach number display toggle,
 * locked starting counter, and global Date-Month-Year configuration.
 */

export interface AppSettings {
  showCoachNumbersOnMainPage: boolean; // Master toggle requested by user
  startingCounter: string;            // Permanently locked to "Mirpur-10"
  dateFormat: 'DD-MM-YYYY';           // Always Date-Month-Year
  terminalStation: string;            // "Mirpur-10 Terminal"
  terminalNoticeBengali: string;      // "এই সফটওয়্যারটা শুধুমাত্র মিরপুর ১০ এর জন্য বানানো হয়েছে."
  companyName: string;
  autoPrintReceipts: boolean;
  defaultBoardingPoint: string;
  defaultFuelAdvance: number;
}

const STORAGE_KEY = 'lsp_app_settings_v3';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  showCoachNumbersOnMainPage: true,
  startingCounter: 'Mirpur-10', // Strictly locked to Mirpur-10
  dateFormat: 'DD-MM-YYYY',    // Date-Month-Year
  terminalStation: 'Mirpur-10 Terminal',
  terminalNoticeBengali: 'এই সফটওয়্যারটা শুধুমাত্র মিরপুর ১০ এর জন্য বানানো হয়েছে.',
  companyName: 'Lal Sabuj Paribahan',
  autoPrintReceipts: false,
  defaultBoardingPoint: 'Mirpur-10',
  defaultFuelAdvance: 4500,
};

class AppSettingsService {
  private settings: AppSettings = DEFAULT_APP_SETTINGS;
  private listeners: Array<(settings: AppSettings) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Force starting counter to remain "Mirpur-10" and dateFormat to "DD-MM-YYYY"
        this.settings = {
          ...DEFAULT_APP_SETTINGS,
          ...parsed,
          startingCounter: 'Mirpur-10',
          dateFormat: 'DD-MM-YYYY',
        };
      }
    } catch (e) {
      console.warn('Could not read app settings:', e);
    }
  }

  public getSettings(): AppSettings {
    return { ...this.settings, startingCounter: 'Mirpur-10', dateFormat: 'DD-MM-YYYY' };
  }

  public updateSettings(partial: Partial<AppSettings>) {
    // Prevent changing startingCounter away from Mirpur-10 or dateFormat away from DD-MM-YYYY
    const safePartial = { ...partial };
    delete safePartial.startingCounter;
    delete safePartial.dateFormat;

    this.settings = {
      ...this.settings,
      ...safePartial,
      startingCounter: 'Mirpur-10',
      dateFormat: 'DD-MM-YYYY',
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Could not save app settings:', e);
    }
    this.notify();
  }

  public toggleCoachNumbers() {
    this.updateSettings({
      showCoachNumbersOnMainPage: !this.settings.showCoachNumbersOnMainPage,
    });
  }

  public setShowCoachNumbers(show: boolean) {
    this.updateSettings({
      showCoachNumbersOnMainPage: show,
    });
  }

  public subscribe(callback: (settings: AppSettings) => void): () => void {
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
        console.error('Error in app settings listener:', err);
      }
    });
  }
}

export const appSettingsService = new AppSettingsService();
