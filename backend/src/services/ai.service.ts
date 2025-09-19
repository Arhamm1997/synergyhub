import { LanguageServiceClient } from '@google-ai/generativelanguage';
import { GoogleAuth } from 'google-auth-library';
import { config } from '../config';

const MODEL_NAME = 'models/text-bison-001';

const client = new LanguageServiceClient({
  authClient: new GoogleAuth().fromAPIKey(config.googleAiApiKey)
});

interface NotificationInput {
  id: string;
  message: string;
  type: string;
  timestamp: string;
}

interface PrioritizedNotification {
  id: string;
  priorityScore: number;
}

export const prioritizeNotifications = async (
  input: { notifications: NotificationInput[] }
): Promise<PrioritizedNotification[]> => {
  try {
    const prompt = `
      Given these notifications, assign a priority score (0-100) to each based on:
      - Urgency of the action required
      - Time sensitivity
      - Impact on business/project
      - User role relevance
      
      Notifications:
      ${input.notifications
        .map(
          (n) => `ID: ${n.id}
          Message: ${n.message}
          Type: ${n.type}
          Time: ${n.timestamp}`
        )
        .join('\n\n')}
      
      Return a JSON array with each notification's ID and priority score.
    `;

    const result = await client.generateText({
      model: MODEL_NAME,
      prompt: {
        text: prompt
      }
    });

    const output = result[0]?.candidates?.[0]?.output;
    if (!output) {
      throw new Error('No output from AI model');
    }

    // Extract JSON from the output
    const jsonMatch = output.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const prioritizedNotifications = JSON.parse(jsonMatch[0]);

    // Validate and format the response
    return prioritizedNotifications.map((pn: any) => ({
      id: pn.id,
      priorityScore: Math.min(100, Math.max(0, pn.priorityScore))
    }));
  } catch (error) {
    console.error('Error prioritizing notifications:', error);
    // Return default priorities on error
    return input.notifications.map(n => ({
      id: n.id,
      priorityScore: 50 // Default medium priority
    }));
  }
};