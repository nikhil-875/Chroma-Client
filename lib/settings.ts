// Settings module for fetching and storing application settings

export interface Settings {
  chromaUrl: string;
  openaiApiKey?: string;
}

const DEFAULT_SETTINGS: Settings = {
  chromaUrl: "http://localhost:8000"
};

/**
 * Get settings from localStorage (client-side) or return defaults (server-side)
 */
export async function getSettings(): Promise<Settings> {
  if (typeof window === "undefined") {
    // Server-side: return defaults or environment variables
    return {
      chromaUrl: process.env.CHROMA_URL || DEFAULT_SETTINGS.chromaUrl,
    };
  }

  // Client-side: get from localStorage
  const settings = localStorage.getItem("chroma-settings");
  return settings
    ? JSON.parse(settings)
    : DEFAULT_SETTINGS;
}

/**
 * Update settings in localStorage (client-side only)
 */
export async function updateSettings(settings: Settings): Promise<void> {
  if (typeof window === "undefined") return;

  localStorage.setItem("chroma-settings", JSON.stringify(settings));
}

/**
 * Get Chroma URL from settings
 */
export async function getChromaUrl(): Promise<string> {
  const settings = await getSettings();
  return settings.chromaUrl;
} 