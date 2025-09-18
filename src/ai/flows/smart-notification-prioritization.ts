'use server';

/**
 * @fileOverview This file contains a Genkit flow for prioritizing notifications based on urgency and relevance.
 *
 * It exports:
 * - `prioritizeNotifications`: An async function that takes a list of notifications and returns them sorted by priority.
 * - `NotificationInput`: The input type for the prioritizeNotifications function.
 * - `NotificationOutput`: The output type for the prioritizeNotifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationInputSchema = z.object({
  notifications: z.array(
    z.object({
      id: z.string(),
      message: z.string(),
      type: z.string(),
      timestamp: z.string(),
      relevantEntities: z.array(z.string()).optional(),
    })
  ).describe('An array of notifications to be prioritized.'),
  userRole: z.enum(['Admin', 'Team Lead', 'Employee', 'Client']).describe('The role of the user receiving the notifications.'),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.array(
  z.object({
    id: z.string(),
    message: z.string(),
    type: z.string(),
    timestamp: z.string(),
    priorityScore: z.number().describe('A score indicating the priority of the notification.'),
  })
).describe('An array of notifications sorted by priority (highest to lowest).');
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

export async function prioritizeNotifications(input: NotificationInput): Promise<NotificationOutput> {
  return prioritizeNotificationsFlow(input);
}

const prioritizeNotificationsPrompt = ai.definePrompt({
  name: 'prioritizeNotificationsPrompt',
  input: {schema: NotificationInputSchema},
  output: {schema: NotificationOutputSchema},
  prompt: `You are an AI assistant designed to prioritize notifications for users in a team management platform. Prioritize notifications based on their urgency and relevance to the user, considering their role.

  User Role: {{{userRole}}}

  Here are the notifications to prioritize:
  {{#each notifications}}
  - ID: {{id}}, Message: {{message}}, Type: {{type}}, Timestamp: {{timestamp}}{{#if relevantEntities}}, Relevant Entities: {{relevantEntities}}{{/if}}
  {{/each}}

  Return the notifications sorted by priority, with the most important notifications first. Include a priorityScore for each notification, indicating its importance (higher score = higher priority). The score should take into account the user's role and the notification's relevance to that role. For example, notifications related to tasks assigned to the user, or critical updates for the user's projects should be prioritized.

  Ensure that the output is a JSON array of notifications, with each notification including the id, message, type, timestamp, and priorityScore.
  The priorityScore should be between 0 and 100.
  `,
});

const prioritizeNotificationsFlow = ai.defineFlow(
  {
    name: 'prioritizeNotificationsFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async input => {
    const {output} = await prioritizeNotificationsPrompt(input);
    return output!;
  }
);
