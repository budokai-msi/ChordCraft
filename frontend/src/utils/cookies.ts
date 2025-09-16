// Cookie utility functions for ChordCraft
export interface CookieOptions {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

export class CookieManager {
  /**
   * Set a cookie with the given name, value, and options
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const date = new Date();
        date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
        cookieString += `; expires=${date.toUTCString()}`;
      } else {
        cookieString += `; expires=${options.expires.toUTCString()}`;
      }
    }

    if (options.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options.secure) {
      cookieString += '; secure';
    }

    if (options.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    if (options.httpOnly) {
      cookieString += '; httponly';
    }

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static get(name: string): string | null {
    const nameEQ = encodeURIComponent(name) + '=';
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Remove a cookie by name
   */
  static remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    this.set(name, '', {
      ...options,
      expires: new Date(0)
    });
  }

  /**
   * Check if a cookie exists
   */
  static exists(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAll(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
}

// Specific cookie functions for ChordCraft
export const ChordCraftCookies = {
  // User preferences
  setTheme: (theme: 'light' | 'dark' | 'auto') => {
    CookieManager.set('chordcraft_theme', theme, { expires: 365 });
  },
  
  getTheme: (): 'light' | 'dark' | 'auto' => {
    return (CookieManager.get('chordcraft_theme') as 'light' | 'dark' | 'auto') || 'auto';
  },

  // User settings
  setUserPreference: (key: string, value: any) => {
    CookieManager.set(`chordcraft_pref_${key}`, JSON.stringify(value), { expires: 365 });
  },

  getUserPreference: <T>(key: string, defaultValue: T): T => {
    const value = CookieManager.get(`chordcraft_pref_${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  },

  // Session preferences
  setSessionPreference: (key: string, value: any) => {
    CookieManager.set(`chordcraft_session_${key}`, JSON.stringify(value), { expires: 1 });
  },

  getSessionPreference: <T>(key: string, defaultValue: T): T => {
    const value = CookieManager.get(`chordcraft_session_${key}`);
    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  },

  // Audio preferences
  setAudioSettings: (settings: {
    volume: number;
    tempo: number;
    key: string;
    instrument: string;
  }) => {
    CookieManager.set('chordcraft_audio', JSON.stringify(settings), { expires: 30 });
  },

  getAudioSettings: () => {
    const settings = CookieManager.get('chordcraft_audio');
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Clear all ChordCraft cookies
  clearAll: () => {
    const cookies = CookieManager.getAll();
    Object.keys(cookies).forEach(key => {
      if (key.startsWith('chordcraft_')) {
        CookieManager.remove(key);
      }
    });
  }
};

// Cookie consent management
export interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  timestamp: number;
}

export const CookieConsentManager = {
  setConsent: (consent: Partial<CookieConsent>) => {
    const currentConsent = CookieConsentManager.getConsent();
    const newConsent: CookieConsent = {
      necessary: true, // Always true
      analytics: consent.analytics ?? currentConsent.analytics ?? false,
      marketing: consent.marketing ?? currentConsent.marketing ?? false,
      preferences: consent.preferences ?? currentConsent.preferences ?? false,
      timestamp: Date.now()
    };
    
    CookieManager.set('chordcraft_consent', JSON.stringify(newConsent), { 
      expires: 365,
      sameSite: 'lax'
    });
  },

  getConsent: (): CookieConsent => {
    const consent = CookieManager.get('chordcraft_consent');
    if (consent) {
      try {
        return JSON.parse(consent);
      } catch {
        return CookieConsentManager.getDefaultConsent();
      }
    }
    return CookieConsentManager.getDefaultConsent();
  },

  getDefaultConsent: (): CookieConsent => ({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
    timestamp: 0
  }),

  hasConsent: (): boolean => {
    const consent = CookieConsentManager.getConsent();
    return consent.timestamp > 0;
  },

  canUseAnalytics: (): boolean => {
    return CookieConsentManager.getConsent().analytics;
  },

  canUseMarketing: (): boolean => {
    return CookieConsentManager.getConsent().marketing;
  },

  canUsePreferences: (): boolean => {
    return CookieConsentManager.getConsent().preferences;
  }
};
