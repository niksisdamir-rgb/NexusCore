import { GeminiProvider } from "../llm/providers/GeminiProvider";

export type VoiceIntent = 
  | "QUERY_SENSOR" 
  | "START_PRODUCTION" 
  | "CHECK_INVENTORY" 
  | "MAINTENANCE_STATUS" 
  | "EMERGENCY_STOP" 
  | "UNKNOWN";

export interface VoiceAction {
  intent: VoiceIntent;
  target?: string;
  parameters?: Record<string, any>;
  rawText: string;
}

export class VoiceCommandAgent {
  private llm = new GeminiProvider();

  async parseIntent(text: string): Promise<VoiceAction> {
    const prompt = `
      You are an Industrial SCADA Voice Controller for the Elkonmix-90 concrete plant.
      Your task is to convert raw voice transcripts from operators into structured JSON actions.
      The plant components include: 
      - Mixer (Mešalica)
      - Conveyor (Transportna traka / Kosa traka)
      - Silo 1 (Cement)
      - Silo 2 (Sand / Pesak)
      - Silo 3 (Gravel / Šljunak)
      - Water Tank (Rezervoar za vodu)
      - Additive Tank (Rezervoar za aditive)
      - Weighing Scale (Vaga)

      Common recipes: MB-20, MB-25, MB-30.

      Possible Intents:
      - QUERY_SENSOR: Asking for a status or reading (e.g., "What is the humidity in Silo 1?", "Kika je vlaga u pesku?")
      - START_PRODUCTION: Ordering a batch (e.g., "Start 2 cubic meters of MB-30", "Pokreni MB-30 od 2 m3")
      - CHECK_INVENTORY: Asking about material stock (e.g., "How much cement is left?", "Koliko imamo cementa?")
      - MAINTENANCE_STATUS: Asking about hardware health (e.g., "How is the mixer doing?", "Kakva je mešalica?")
      - EMERGENCY_STOP: Immediate stop command.
      
      Output ONLY a JSON object:
      {
        "intent": "INTENT_NAME",
        "target": "affected_component_or_recipe",
        "parameters": { "quantity": number, "unit": "string", "sensor": "string" },
        "rawText": "original text"
      }

      Operator Command: "${text}"
    `;

    try {
      const response = await this.llm.generate({ prompt });
      // Clean possible markdown backticks
      const cleanJson = response.text.replace(/```json|```/g, "").trim();
      return JSON.parse(cleanJson);
    } catch (error) {
       console.error("VoiceAgent Error:", error);
       return { intent: "UNKNOWN", rawText: text };
    }
  }
}
