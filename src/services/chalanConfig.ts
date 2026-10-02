export interface ChalanPrintConfig {
  heightInches: number;   // e.g. 5.85 (Exact Half of A4 = 5.846 in / 148.5 mm)
  widthInches: number;    // e.g. 8.27 (A4 width = 210 mm)
  marginTopMm: number;    // e.g. 4 mm
  marginBottomMm: number; // e.g. 4 mm
  marginLeftMm: number;   // e.g. 5 mm
  marginRightMm: number;  // e.g. 5 mm
  scalePercent: number;   // e.g. 100%
  orientation: 'portrait' | 'landscape';
  showCutMark: boolean;   // Scissor cut line at bottom
  densityMode: 'auto' | 'compact' | 'standard' | 'spacious';
}

export const EXACT_HALF_A4_HEIGHT_INCHES = 5.85; // 148.5 mm
export const EXACT_HALF_A4_HEIGHT_MM = 148.5;
export const STANDARD_A4_HEIGHT_INCHES = 11.69;  // 297 mm
export const STANDARD_A4_WIDTH_INCHES = 8.27;    // 210 mm

const STORAGE_KEY = 'lsp_chalan_print_dimension_config_v2';

export const DEFAULT_CHALAN_CONFIG: ChalanPrintConfig = {
  heightInches: EXACT_HALF_A4_HEIGHT_INCHES,
  widthInches: STANDARD_A4_WIDTH_INCHES,
  marginTopMm: 4,
  marginBottomMm: 4,
  marginLeftMm: 5,
  marginRightMm: 5,
  scalePercent: 100,
  orientation: 'portrait',
  showCutMark: true,
  densityMode: 'auto',
};

class ChalanConfigService {
  private config: ChalanPrintConfig = DEFAULT_CHALAN_CONFIG;
  private listeners: Array<(config: ChalanPrintConfig) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.config = { ...DEFAULT_CHALAN_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read chalan print config:', e);
    }
  }

  public getConfig(): ChalanPrintConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ChalanPrintConfig>) {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.warn('Could not save chalan print config:', e);
    }
    this.notify();
  }

  public resetToHalfA4() {
    this.updateConfig({
      heightInches: EXACT_HALF_A4_HEIGHT_INCHES,
      widthInches: STANDARD_A4_WIDTH_INCHES,
      scalePercent: 100,
      showCutMark: true,
    });
  }

  /**
   * Adjust height by an increment in inches (e.g. +0.5 or -0.5 inches)
   */
  public adjustHeight(deltaInches: number) {
    const newHeight = Math.max(3.0, Math.min(11.69, parseFloat((this.config.heightInches + deltaInches).toFixed(2))));
    this.updateConfig({ heightInches: newHeight });
  }

  public subscribe(callback: (config: ChalanPrintConfig) => void): () => void {
    this.listeners.push(callback);
    callback(this.getConfig());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb(this.getConfig());
      } catch (err) {
        console.error('Error in chalan config listener:', err);
      }
    });
  }
}

export const chalanConfigService = new ChalanConfigService();
