import { RecipeTransformer } from '@/ai/data/transformers/RecipeTransformer';
import { GeminiProvider } from '@/ai/llm/providers/GeminiProvider';

// Mock the GeminiProvider
jest.mock('@/ai/llm/providers/GeminiProvider');

describe('RecipeTransformer', () => {
  let transformer: RecipeTransformer;
  let mockGemini: jest.Mocked<GeminiProvider>;

  beforeEach(() => {
    transformer = new RecipeTransformer();
    mockGemini = (transformer as any).llm; // Access private member for testing
  });

  it('should correctly parse a valid JSON response from Gemini', async () => {
    const mockResponse = {
      text: JSON.stringify({
        name: "C30/37 XC4",
        cementAmount: 350,
        waterAmount: 175,
        sandAmount: 850,
        gravelAmount: 1100,
        admixtureAmount: 3.5,
        confidence: "HIGH"
      }),
      usage: { promptTokens: 100, completionTokens: 50 }
    };

    mockGemini.generate.mockResolvedValue(mockResponse);

    const result = await transformer.transform("Some raw text about concrete...");

    expect(result).not.toBeNull();
    expect(result?.name).toBe("C30/37 XC4");
    expect(result?.cementAmount).toBe(350);
    expect(result?.admixtureAmount).toBe(3.5);
    expect(result?.confidence).toBe("HIGH");
  });

  it('should handle markdown code blocks in Gemini response', async () => {
    const mockResponse = {
      text: "```json\n{\n  \"name\": \"C25/30\",\n  \"cementAmount\": 300,\n  \"waterAmount\": 150,\n  \"sandAmount\": 800,\n  \"gravelAmount\": 1000,\n  \"admixtureAmount\": null,\n  \"confidence\": \"MEDIUM\"\n}\n```",
      usage: { promptTokens: 100, completionTokens: 50 }
    };

    mockGemini.generate.mockResolvedValue(mockResponse);

    const result = await transformer.transform("Raw text...");

    expect(result).not.toBeNull();
    expect(result?.name).toBe("C25/30");
    expect(result?.cementAmount).toBe(300);
    expect(result?.admixtureAmount).toBeUndefined(); // null becomes undefined in ExtractedRecipe
  });

  it('should return null if required fields are missing', async () => {
    const mockResponse = {
      text: JSON.stringify({
        name: "Incomplete Recipe",
        cementAmount: 300
        // missing water, sand, gravel
      }),
      usage: { promptTokens: 100, completionTokens: 50 }
    };

    mockGemini.generate.mockResolvedValue(mockResponse);

    const result = await transformer.transform("Incomplete text...");

    expect(result).toBeNull();
  });

  it('should return null if JSON parsing fails', async () => {
    mockGemini.generate.mockResolvedValue({
      text: "Not a JSON string",
      usage: { promptTokens: 0, completionTokens: 0 }
    });

    const result = await transformer.transform("Garbage...");

    expect(result).toBeNull();
  });
});
