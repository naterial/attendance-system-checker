
'use server';
/**
 * @fileOverview An AI flow to summarize daily attendance notes.
 *
 * - summarizeNotes - A function that handles the note summarization process.
 */

import { ai } from '@/ai/genkit';
import type { SummarizeNotesInput, SummarizeNotesOutput } from '@/lib/types';
import { SummarizeNotesInputSchema, SummarizeNotesOutputSchema } from '@/lib/types';

export async function summarizeNotes(input: SummarizeNotesInput): Promise<SummarizeNotesOutput> {
  return summarizeNotesFlow(input);
}

const summarizeNotesPrompt = ai.definePrompt({
  name: 'summarizeNotesPrompt',
  input: { schema: SummarizeNotesInputSchema },
  output: { schema: SummarizeNotesOutputSchema },
  prompt: `You are an expert operations manager for a community centre for the elderly.
Your task is to analyze the daily notes submitted by your staff (carers, cooks, cleaners, etc.) and create a clear, concise summary.

Your summary should be easy to read and must highlight the most important information for the day.
Organize your summary into logical categories like "Key Highlights", "Issues & Concerns", "Supply Needs", or "Maintenance Alerts" if applicable.
If there are no notes for a category, do not include it.

Here are the notes for the day:
{{#each notes}}
- {{{this}}}
{{/each}}

Based on these notes, provide your summary.
`,
});

const summarizeNotesFlow = ai.defineFlow(
  {
    name: 'summarizeNotesFlow',
    inputSchema: SummarizeNotesInputSchema,
    outputSchema: SummarizeNotesOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeNotesPrompt(input);
    
    if (!output) {
        throw new Error("The AI model did not return a valid summary.");
    }
    
    return output;
  }
);
