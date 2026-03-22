import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with the key from our environment variables
// Note: In Vite, environment variables must be prefixed with VITE_
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Create a generic fallback if no key is provided
export const isGeminiConfigured = () => {
    return API_KEY !== undefined && API_KEY !== '' && API_KEY !== 'your-gemini-api-key-here';
};

const genAI = isGeminiConfigured() ? new GoogleGenerativeAI(API_KEY) : null;

// Define our fallback cascade of models
const fallbackModels = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro"
];
/**
 * Generate a response using Google Gemini
 * 
 * @param {string} prompt - The user's input/question
 * @param {object} contextData - Context about the server to inject into the prompt
 * @returns {Promise<string>} The AI response text
 */
export const generateGeminiResponse = async (prompt, contextData, fileData = null) => {
    if (!isGeminiConfigured() || !genAI) {
        return "Error: Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your frontend/.env file.";
    }

    // Construct a master prompt giving Gemini context about the application and the selected instance
    let systemContext = `
    You are a helpful Real-Time Cloud Optimization AI Assistant and Predictor.
    You are integrated into a Cloud Cost Dashboard that simulates real-time metrics.
    
    Current Server Status Context:
    - Server Name: ${contextData?.name || 'Unknown'}
    - Environment Region: ${contextData?.region || 'Unknown'}
    - Current CPU Usage: ${contextData?.cpu_usage?.toFixed(1) || 0}%
    - Current RAM Usage: ${contextData?.ram_usage?.toFixed(1) || 0}%
    - Current Storage Usage: ${contextData?.storage_usage?.toFixed(1) || 0}%
    - Monthly Cost Tracking: $${contextData?.monthly_cost?.toFixed(2) || '0.00'}
    - Overall Health Status: ${contextData?.status || 'Unknown'}

    Your Capabilities:
    1. Respond with ALL the possibilities and strategies for cloud cost optimization. This includes but is not limited to:
       - **Rightsizing**: Analyzing CPU/RAM trends to downsize overprovisioned instances.
       - **Instance Scheduling**: Automatically stopping instances during non-business hours (10 PM - 6 AM).
       - **Spot Instances**: Migrating fault-tolerant workloads to much cheaper spot capacity.
       - **Reserved Instances (RIs) / Savings Plans**: Committing to 1-3 year terms for 72% cost reduction.
       - **Storage Optimization**: Identifying unattached EBS volumes, old snapshots, and moving rarely accessed data to S3 Glacier/Archival tiers.
       - **Region/Zone Shifting**: Moving workloads to cheaper regions (e.g., ap-south-1 vs us-east-1).
       - **Auto-scaling**: Implementing horizontal pod autoscaling to match demand exactly.
       - **Idle Resource Termination**: Detecting and killing "zombie" instances with <1% usage.
    2. Analyze raw data or CSV files if attached and extract actionable predicted insights.
    3. Make real-time predictions based on current metrics (e.g., "At this rate, your storage will hit 100% in 12 days").
    4. Provide a full cost-benefit analysis for any suggestion.

    Your goal is to answer the user's questions regarding their cloud infrastructure, provide optimization advice based on this context, and act as a highly knowledgeable DevOps/FinOps predictive assistant. Use professional but encouraging tone. Format everything beautifully using markdown (tables, bold text, bullet points).
  `;

    let fullPrompt = `${systemContext}\n\nUser Message: ${prompt}`;

    if (fileData) {
        fullPrompt += `\n\nATTACHED FILE DATA (RAW/CSV):\n${fileData}\n\nPlease analyze this data carefully and include predictions/insights.`;
    }

    let lastError = null;

    // Iterate through our fallback models if rate limits are hit
    for (const modelName of fallbackModels) {
        try {
            const currentModel = genAI.getGenerativeModel({ model: modelName });
            const result = await currentModel.generateContent(fullPrompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`Gemini API Error with model ${modelName}:`, error.message);
            lastError = error;
            // Only continue to the next model if it's a 429 Quota/Rate Limit error
            const errMsg = error.message || '';
            if (errMsg.includes('429') || errMsg.includes('Quota exceeded') || errMsg.includes('Resource has been exhausted')) {
                console.log(`Falling back from ${modelName} due to quota limits...`);
                continue; // Try the next model in the loop
            } else {
                // If it's a different error (e.g., auth failure, safety block), break and return it
                break;
            }
        }
    }

    // If we exhaust all models or break early, return the graceful user-facing error containing our final catch
    console.error("All Gemini API fallbacks exhausted or failed:", lastError);
    return "I encountered an error trying to connect to Google Gemini (or all model quotas are temporarily exhausted). Please check your API key and connection, or retry in a few moments.";
};
