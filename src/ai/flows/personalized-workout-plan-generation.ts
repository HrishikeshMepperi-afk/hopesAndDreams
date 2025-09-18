'use server';

/**
 * @fileOverview Generates personalized workout plans based on medical history, fitness level, and workout history.
 *
 * - generateWorkoutPlan - A function that generates a workout plan for a user.
 * - WorkoutPlanInput - The input type for the generateWorkoutPlan function.
 * - WorkoutPlanOutput - The return type for the generateWorkoutPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorkoutPlanInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  sex: z.string().describe('The sex of the user.'),
  height: z.number().describe('The height of the user in centimeters.'),
  weight: z.number().describe('The weight of the user in kilograms.'),
  medicalHistory: z
    .string()
    .describe(
      'The medical history of the user, including any conditions or surgeries. This will be "No specific conditions reported." if the user has not reported any.'
    ),
  fitnessLevel: z
    .string()
    .describe(
      'The fitness level of the user (e.g., beginner, intermediate, advanced).'
    ),
  workoutHistory: z
    .string()
    .describe(
      'The workout history of the user, including types of exercises and frequency.'
    ),
});
export type WorkoutPlanInput = z.infer<typeof WorkoutPlanInputSchema>;

const WorkoutPlanOutputSchema = z.object({
  workoutPlan: z
    .string()
    .describe(
      'A personalized workout plan tailored to the user, including a title, specific exercises, sets, reps, and rest times. The workout plan MUST be in markdown format.'
    ),
});
export type WorkoutPlanOutput = z.infer<typeof WorkoutPlanOutputSchema>;

export async function generateWorkoutPlan(
  input: WorkoutPlanInput
): Promise<WorkoutPlanOutput> {
  return generateWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWorkoutPlanPrompt',
  input: {schema: WorkoutPlanInputSchema},
  output: {schema: WorkoutPlanOutputSchema},
  prompt: `You are an expert AI personal trainer. Your task is to generate a personalized workout plan based on the user's information.

  Your response MUST be a workout plan in markdown format. Follow this structure precisely:
  1.  Start with a main title for the plan using '#'. Example: '# Weekly Fitness Kickstarter'.
  2.  Use '##' for each day's title. Example: '## Day 1: Full Body Strength'.
  3.  Use '###' for each exercise name. Example: '### Push-ups'.
  4.  Use bullet points ('-') for details like sets, reps, and rest. Example: '- Sets: 3', '- Reps: 10-12', '- Rest: 60s'.

  IMPORTANT:
  - If the medical history is "No specific conditions reported," create a general plan suitable for the user's fitness level.
  - If there are medical conditions, create a safe workout plan that avoids exercises that could be harmful.
  - Do NOT include any disclaimers or introductory/concluding text. The application UI will handle that.

  User's information:
  - Age: {{{age}}}
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - Medical History: {{{medicalHistory}}}
  - Fitness Level: {{{fitnessLevel}}}
  - Workout History: {{{workoutHistory}}}
  `,
});

const generateWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'generateWorkoutPlanFlow',
    inputSchema: WorkoutPlanInputSchema,
    outputSchema: WorkoutPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
