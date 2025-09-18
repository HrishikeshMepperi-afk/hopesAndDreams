'use server';

/**
 * @fileOverview Extracts medical conditions from a PDF document.
 *
 * - extractMedicalConditions - A function that extracts medical conditions from a PDF document.
 * - ExtractMedicalConditionsInput - The input type for the extractMedicalConditions function.
 * - ExtractMedicalConditionsOutput - The return type for the extractMedicalConditions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractMedicalConditionsInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type ExtractMedicalConditionsInput = z.infer<
  typeof ExtractMedicalConditionsInputSchema
>;

const ExtractMedicalConditionsOutputSchema = z.object({
  medicalConditions: z
    .array(z.string())
    .describe('The extracted medical conditions from the PDF document.'),
});
export type ExtractMedicalConditionsOutput = z.infer<
  typeof ExtractMedicalConditionsOutputSchema
>;

export async function extractMedicalConditions(
  input: ExtractMedicalConditionsInput
): Promise<ExtractMedicalConditionsOutput> {
  return extractMedicalConditionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractMedicalConditionsPrompt',
  input: {schema: ExtractMedicalConditionsInputSchema},
  output: {schema: ExtractMedicalConditionsOutputSchema},
  prompt: `You are a medical document processing expert.

You will extract medical conditions from the following PDF document.

Make sure to return a simple list of medical conditions that you found.

PDF Document: {{media url=pdfDataUri}}`,
});

const extractMedicalConditionsFlow = ai.defineFlow(
  {
    name: 'extractMedicalConditionsFlow',
    inputSchema: ExtractMedicalConditionsInputSchema,
    outputSchema: ExtractMedicalConditionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
