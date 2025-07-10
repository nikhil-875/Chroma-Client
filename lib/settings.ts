// Settings module for fetching and storing application settings

export interface Settings {
  chromaUrl: string;
  openaiApiKey?: string;
}

const DEFAULT_SETTINGS: Settings = {
  chromaUrl: "https://chromadb.estatemanager.online"
};

/**
 * Get settings from localStorage (client-side) or return defaults (server-side)
 */
export async function getSettings(): Promise<Settings> {
  if (typeof window === "undefined") {
    // Server-side: return defaults or environment variables
    const chromaUrl = process.env.CHROMA_URL || DEFAULT_SETTINGS.chromaUrl;
    console.log(`Server-side settings: Using ChromaDB URL: ${chromaUrl}`);
    return {
      chromaUrl,
    };
  }

  // Client-side: get from localStorage
  const settings = localStorage.getItem("chroma-settings");
  const parsedSettings = settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  console.log(`Client-side settings: Using ChromaDB URL: ${parsedSettings.chromaUrl}`);
  return parsedSettings;
}

/**
 * Update settings in localStorage (client-side only)
 */
export async function updateSettings(settings: Settings): Promise<void> {
  if (typeof window === "undefined") return;

  console.log(`Updating settings with ChromaDB URL: ${settings.chromaUrl}`);
  localStorage.setItem("chroma-settings", JSON.stringify(settings));
}

/**
 * Get Chroma URL from settings
 */
export async function getChromaUrl(): Promise<string> {
  const settings = await getSettings();
  return settings.chromaUrl;
} 