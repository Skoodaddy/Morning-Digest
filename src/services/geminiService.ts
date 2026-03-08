import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RomanticEvent } from "../types";

let ai: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateDigest() {
  const genAI = getGenAI();
  
  // Step 1: Get local events using Maps Grounding
  const localEventsPrompt = `Find upcoming events prioritizing Concord, Salisbury, Kannapolis, then Charlotte, Matthews, Pineville. EXCLUDE all 'clubbing' or wild night life events. Focus on couples events, family-oriented events, theater shows, orchestras, etc. Also search for romantic events in the greater Charlotte metro area occurring in the next 1 to 2 weeks.`;
  
  let localEventsContext = "";
  try {
    const mapsResponse = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: localEventsPrompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 35.4087, // Concord, NC
              longitude: -80.5816
            }
          }
        }
      }
    });
    localEventsContext = mapsResponse.text || "";
  } catch (e) {
    console.error("Error fetching local events:", e);
  }

  // Step 2: Generate the full digest
  const systemInstruction = `You are a backend data aggregation engine. Your objective is to compile a daily morning digest for a user in Concord, NC. You must output the requested data strictly in the provided JSON schema.

STRICT RULE 1: Do not use any emojis anywhere in your output.
STRICT RULE 2: All URLs must be complete, valid, and unformatted.
STRICT RULE 3: For all image URLs (meals, news, quote), you MUST use the googleSearch tool to find REAL, valid image URLs. Do not hallucinate URLs.
STRICT RULE 4: Whenever you link a source (for Meals, Tech Updates, World Events, Local Events, School Events, Romantic Events), you MUST extract and use the actual 'thumbnailUrl' or main image provided directly within that specific article/recipe. DO NOT use AI generated images for these.
STRICT RULE 5: DO NOT HALLUCINATE URLs. Every single URL you provide (for articles, events, recipes, and images) MUST be an exact, real URL that you found in your googleSearch results. If you cannot find a real URL, omit the item.

Execute the following logic to populate the JSON fields:

Weather: Fetch current weather, precipitation probability, and the next 12 hours of forecast data for Concord, NC.
Meals: Generate AT LEAST 3 fast, healthy dinner ideas suitable for two adults and four children (ages 7, 5, 3.5, and 2.5). For each meal, include a valid recipe URL. You MUST extract and use the actual thumbnail image URL provided directly within that specific recipe's page for the 'imageUrl'. Also include the ingredients list, step-by-step instructions, and cooking time.
Family Section:
Search for AT LEAST 3 romantic events in the greater Charlotte metro area occurring in the next 1 to 2 weeks. Include a REAL URL to the event source and a thumbnailUrl.
Compare today's date against this list: Lyla (Jan 22), Mother's Day (May 10), Sarah (May 21), Rose (July 3), Lily (July 14), Anniversary (Aug 9), Michael (Sept 8), Maisy (Nov 5), Sister's Death Anniversary (Dec 13).
If today is exactly 2 months, 1 month, or 2 weeks before any of those dates, populate the "reminders" array with an alert and include this exact URL for flowers: https://www.potsofluckflwrs.com/
Tech Updates: Find AT LEAST 3 recent news articles regarding Google Chrome, Google Workspace, and Google apps. You MUST provide the REAL article URL and extract the actual thumbnail image URL provided directly within that specific article.
World Events: Find AT LEAST 3 major global news headlines with REAL article URLs. You MUST extract and use the actual thumbnail image URL provided directly within that specific article.
Local Events: Find AT LEAST 3 upcoming events prioritizing Concord, Salisbury, Kannapolis, then Charlotte, Matthews, Pineville. EXCLUDE all 'clubbing' or wild night life events. Focus on couples events, family-oriented events, theater shows, orchestras, etc. Include a REAL URL to the event source and a thumbnailUrl.
School Events: Find AT LEAST 3 upcoming dates on the R. Brown McAllister Elementary school calendar. Include a REAL URL to the school calendar source and a thumbnailUrl.
Financials: Output an empty object.
Quote: Provide a quote from a Star Trek character and a valid image URL of that character.

Use the following context for local events if helpful:
${localEventsContext}`;

  const response = await genAI.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: systemInstruction,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          weather: {
            type: Type.OBJECT,
            properties: {
              currentTemperature: { type: Type.NUMBER },
              condition: { type: Type.STRING },
              precipitationProbability: { type: Type.NUMBER },
              hourlyForecast: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    time: { type: Type.STRING },
                    temperature: { type: Type.NUMBER },
                    precipitationProbability: { type: Type.NUMBER }
                  }
                }
              }
            }
          },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                imageUrl: { type: Type.STRING },
                recipeUrl: { type: Type.STRING },
                ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                cookingTime: { type: Type.STRING }
              }
            }
          },
          family: {
            type: Type.OBJECT,
            properties: {
              romanticEvents: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    date: { type: Type.STRING },
                    location: { type: Type.STRING },
                    url: { type: Type.STRING },
                    thumbnailUrl: { type: Type.STRING }
                  }
                }
              },
              reminders: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    alert: { type: Type.STRING },
                    flowerUrl: { type: Type.STRING }
                  }
                }
              }
            }
          },
          techUpdates: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                url: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING }
              }
            }
          },
          worldEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                url: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING }
              }
            }
          },
          localEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                date: { type: Type.STRING },
                location: { type: Type.STRING },
                url: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING }
              }
            }
          },
          schoolEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                date: { type: Type.STRING },
                url: { type: Type.STRING },
                thumbnailUrl: { type: Type.STRING }
              }
            }
          },
          financials: {
            type: Type.OBJECT,
            properties: {}
          },
          quote: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              character: { type: Type.STRING },
              imageUrl: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON", e);
    return null;
  }
}

export async function generateImage(prompt: string, size: string, aspectRatio: string): Promise<string | null> {
  const genAI = getGenAI();
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: size as any
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Error generating image:", e);
  }
  return null;
}

export async function editImage(prompt: string, base64Image: string, mimeType: string): Promise<string | null> {
  const genAI = getGenAI();
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1],
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.error("Error editing image:", e);
  }
  return null;
}

export const refreshFamilyEvents = async (existingEvents: RomanticEvent[]): Promise<RomanticEvent[]> => {
  try {
    const existingTitles = existingEvents.map(e => e.name).join(', ');
    const systemInstruction = `You are a backend data aggregation engine. Your objective is to find NEW romantic events in the greater Charlotte metro area occurring in the next 1 to 2 weeks.
    
STRICT RULE 1: Do not use any emojis anywhere in your output.
STRICT RULE 2: All URLs must be complete, valid, and unformatted.
STRICT RULE 3: DO NOT include any of these existing events: ${existingTitles}
STRICT RULE 4: You MUST include a valid 'thumbnailUrl' from the event source if one exists, so the app can unfurl the link.
STRICT RULE 5: DO NOT HALLUCINATE URLs. Every single URL you provide MUST be an exact, real URL that you found in your googleSearch results. If you cannot find a real URL, omit the item.

Find AT LEAST 3 NEW romantic events in the greater Charlotte metro area occurring in the next 1 to 2 weeks. Include a REAL URL to the event source and a thumbnailUrl.`;

    const ai = getGenAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: systemInstruction,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              date: { type: Type.STRING },
              location: { type: Type.STRING },
              url: { type: Type.STRING },
              thumbnailUrl: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || "[]";
    const data = JSON.parse(jsonStr);
    return data;
  } catch (e) {
    console.error("Error refreshing family events:", e);
    return [];
  }
}
