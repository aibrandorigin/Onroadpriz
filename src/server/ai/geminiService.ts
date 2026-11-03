import { GoogleGenAI } from '@google/genai';
import { SecretsManager } from '../config/secretsManager.js';

export interface GeminiTestResult {
  success: boolean;
  configured: boolean;
  model: string;
  latencyMs?: number;
  sampleResponse?: string;
  error?: string;
  timestamp: string;
}

export class GeminiService {
  private static getClient(): { ai: GoogleGenAI; apiKey: string } | null {
    const apiKey = SecretsManager.get('GEMINI_API_KEY');
    if (!apiKey || apiKey.trim().length === 0) {
      return null;
    }
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    return { ai, apiKey: apiKey.trim() };
  }

  /**
   * Safe admin connectivity test for Gemini API
   * NEVER returns or logs the secret key.
   */
  public static async testConnection(): Promise<GeminiTestResult> {
    const timestamp = new Date().toISOString();
    const clientData = this.getClient();

    if (!clientData) {
      return {
        success: false,
        configured: false,
        model: 'gemini-3.8-flash',
        error: 'GEMINI_API_KEY is not configured in environment or settings.',
        timestamp,
      };
    }

    const { ai } = clientData;
    const startTime = Date.now();

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'Ping. Confirm connection for OnRoadPriz used vehicle platform in 5 words or less.',
      });

      const latencyMs = Date.now() - startTime;
      const text = response.text?.trim() || 'Connected';

      return {
        success: true,
        configured: true,
        model: 'gemini-3.8-flash',
        latencyMs,
        sampleResponse: text,
        timestamp,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const safeErrorMessage = err?.message || 'Failed to communicate with Gemini API';

      // Ensure API key is never present in the error string
      const sanitizedError = safeErrorMessage.replace(/[a-zA-Z0-9_-]{30,}/g, '[REDACTED_KEY]');

      console.error('[GeminiService] Connection test failed:', sanitizedError);
      return {
        success: false,
        configured: true,
        model: 'gemini-3.8-flash',
        latencyMs,
        error: sanitizedError,
        timestamp,
      };
    }
  }

  /**
   * Generate an optimized vehicle description for a seller listing
   */
  public static async generateVehicleDescription(vehicle: {
    make: string;
    model: string;
    variant?: string;
    year: number;
    fuelType?: string;
    transmission?: string;
    kmDriven?: number;
    city?: string;
    price?: number;
  }): Promise<{ success: boolean; description?: string; error?: string }> {
    const clientData = this.getClient();
    if (!clientData) {
      return {
        success: false,
        error: 'Gemini AI is not configured. Please add GEMINI_API_KEY in Admin Settings.',
      };
    }

    try {
      const prompt = `Write an attractive, concise, honest vehicle description for a used car marketplace listing in India.
Details:
- Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.variant || ''}
- Fuel & Transmission: ${vehicle.fuelType || 'Petrol'}, ${vehicle.transmission || 'Manual'}
- Kilometers Driven: ${vehicle.kmDriven ? `${vehicle.kmDriven.toLocaleString('en-IN')} km` : 'Well maintained'}
- Location: ${vehicle.city || 'India'}
- Asking Price: ₹${vehicle.price ? vehicle.price.toLocaleString('en-IN') : 'Negotiable'}
- Direct owner sale, zero dealer brokerage.

Format with 2 short paragraphs highlighting condition, maintenance, and direct owner benefit.`;

      const response = await clientData.ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return {
        success: true,
        description: response.text?.trim(),
      };
    } catch (err: any) {
      console.error('[GeminiService] Description generation failed:', err.message);
      return {
        success: false,
        error: 'AI generation temporarily unavailable.',
      };
    }
  }
}
