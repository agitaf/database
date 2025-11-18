import { GoogleGenAI, Type } from "@google/genai";
import type { DataRow, AnalysisResult, ChatMessage } from '../types';

// Assume process.env.API_KEY is available in the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

function formatDataForPrompt(data: DataRow[], headers: string[]): string {
    const previewRowCount = Math.min(data.length, 20); // Send a preview of up to 20 rows
    const dataPreview = data.slice(0, previewRowCount);
    
    let csvString = headers.join(',') + '\n';
    csvString += dataPreview.map(row => 
        headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
            }
            return value;
        }).join(',')
    ).join('\n');

    return csvString;
}

export const analyzeDataWithGemini = async (data: DataRow[], headers: string[]): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    
    const model = 'gemini-2.5-flash';
    const dataSample = formatDataForPrompt(data, headers);
    
    const prompt = `
        You are an expert e-commerce data analyst and AI agent coordinator. Your primary goal is to analyze sales and product data to provide actionable insights for an online store and suggest automatable tasks for an AI agent.
        The full dataset contains ${data.length} rows. Here is a sample of the data in CSV format:
        ---
        ${dataSample}
        ---
        
        Please provide a detailed analysis in a structured JSON object, covering the following areas:
        1.  **Data Overview**: Briefly describe the data's structure (columns, etc.) and highlight any potential quality issues like missing values or inconsistencies.
        2.  **Key Insights & Sales Performance**: Identify top-selling products, performance by category, and significant sales trends. Provide supporting data where possible.
        3.  **Inventory & Anomaly Detection**: Point out potential inventory issues (e.g., low stock for popular items) and identify any unusual data points or anomalies in sales patterns.
        4.  **Actionable Recommendations**: Suggest 2-3 concrete business actions for a human to perform. Examples include marketing promotions for specific products, inventory restocking priorities, or pricing adjustments.
        5.  **Suggested Agent Tasks**: Suggest 2-3 concrete, automatable tasks for an AI agent. Frame these as direct commands. For example: "Draft an email to the purchasing department to reorder low-stock items" or "Generate a summary report of Q3 sales performance for the management team".
        6.  **Suggested Visualizations**: If the data is suitable, suggest up to two simple visualizations (bar or pie charts). Focus on valuable e-commerce metrics like 'Sales by Category' or 'Top 5 Products by Revenue'. For each chart, provide a title, type, and the aggregated data in a label/value format.

        Populate the JSON object strictly according to the provided schema. Your analysis should be concise, professional, and directly useful for making business decisions.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
          dataOverview: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Briefly describe the dataset's structure (columns, number of records)." },
              qualityIssues: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List any obvious data quality issues noticed in the sample (e.g., missing values, inconsistent formats)."
              }
            }
          },
          keyInsights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                insight: { type: Type.STRING, description: "A significant pattern, trend, or correlation." },
                supportingData: { type: Type.STRING, description: "Brief supporting data or context for the insight." }
              }
            }
          },
          potentialAnomalies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                anomaly: { type: Type.STRING, description: "A data point or pattern that seems unusual." },
                details: { type: Type.STRING, description: "Why this is considered an anomaly." }
              }
            }
          },
          actionableRecommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggest business actions for a human to take based on the analysis."
          },
          suggestedAgentTasks: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggest concrete, automatable tasks for an AI agent based on the analysis. Frame them as commands."
          },
          suggestedVisualizations: {
            type: Type.ARRAY,
            description: "Suggest up to 2 simple charts if the data is suitable. Focus on bar or pie charts.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "A clear title for the chart." },
                type: { type: Type.STRING, description: "The suggested chart type, e.g., 'bar' or 'pie'." },
                data: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING, description: "The label for a data point (e.g., a category on the x-axis)." },
                      value: { type: Type.NUMBER, description: "The numerical value for the data point." }
                    },
                    required: ['label', 'value']
                  }
                }
              },
              required: ['title', 'type', 'data']
            }
          }
        }
      };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        return JSON.parse(response.text) as AnalysisResult;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof SyntaxError) {
             throw new Error("Failed to parse the analysis from the AI. The response was not valid JSON.");
        }
        throw new Error("Failed to get analysis from the AI. The model may be overloaded or an API error occurred.");
    }
};

export const continueChat = async (
    data: DataRow[], 
    headers: string[], 
    initialAnalysis: AnalysisResult, 
    chatHistory: ChatMessage[]
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    
    const model = 'gemini-2.5-flash';
    const dataSample = formatDataForPrompt(data, headers);

    const systemInstruction = `You are an expert e-commerce data analyst continuing a conversation with a user about their data. 
    You have already provided an initial analysis. Be helpful, concise, and stay focused on analyzing the provided data.
    
    Here is a sample of the user's data in CSV format:
    ---
    ${dataSample}
    ---
    
    Here is the initial JSON analysis you provided:
    ---
    ${JSON.stringify(initialAnalysis, null, 2)}
    ---
    `;

    const contents = chatHistory.map(message => ({
        role: message.role,
        parts: [{ text: message.text }]
    }));

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                systemInstruction,
            },
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        throw new Error("Failed to get a response from the AI. The model may be overloaded or an API error occurred.");
    }
};