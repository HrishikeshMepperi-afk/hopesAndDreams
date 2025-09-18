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
      'A personalized workout plan tailored to the user, including specific exercises, sets, reps, and rest times. The workout plan MUST be in markdown format.'
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
  prompt: `You are an AI personal trainer who generates workout plans based on a user's medical history, fitness level, and workout history.

  Your response MUST be a workout plan in markdown format. Start with a main title using '#'. Use '##' for each day's title (e.g., "## Day 1: Full Body Strength"). Use '###' for each exercise name (e.g., "### Push-ups"). Use bullet points ('-') for details like sets, reps, and rest.

  Generate a workout plan that is safe and achievable for the user, taking into account their medical history and fitness level. Pay particular attention to the medical history. If the user has reported medical conditions, ensure the workout plan does not include any exercises that could be harmful. If the medical history is "No specific conditions reported," you can create a general plan appropriate for their fitness level.

  The user's information is as follows:
  - Age: {{{age}}}
  - Sex: {{{sex}}}
  - Height: {{{height}}} cm
  - Weight: {{{weight}}} kg
  - Medical History: {{{medicalHistory}}}
  - Fitness Level: {{{fitnessLevel}}}
  - Workout History: {{{workoutHistory}}}

  Include a variety of exercises targeting different muscle groups. For each exercise, specify the number of sets, repetitions (reps), and rest time. You can also include short, helpful tips for some exercises.

  Do not include the disclaimer in the generated plan. The application UI will handle the disclaimer.
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
