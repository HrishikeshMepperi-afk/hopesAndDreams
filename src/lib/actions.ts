'use server';

import { generateWorkoutPlan } from '@/ai/flows/personalized-workout-plan-generation';
import { extractMedicalConditions } from '@/ai/flows/medical-document-extraction';
import type { UserProfile } from './types';

interface GeneratePlanPayload extends UserProfile {}

export async function generateWorkoutPlanAction(payload: GeneratePlanPayload) {
  try {
    const result = await generateWorkoutPlan({
      age: payload.age,
      sex: payload.sex,
      height: payload.height,
      weight: payload.weight,
      medicalHistory: payload.medicalHistoryText || 'No specific conditions reported.',
      fitnessLevel: payload.fitnessLevel,
      workoutHistory: payload.workoutHistory,
    });
    return { success: true, data: result.workoutPlan };
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return { success: false, error: 'Failed to generate workout plan.' };
  }
}

export async function extractMedicalConditionsAction(pdfDataUri: string) {
  try {
    const result = await extractMedicalConditions({ pdfDataUri });
    return { success: true, data: result.medicalConditions };
  } catch (error) {
    console.error('Error extracting medical conditions:', error);
    return { success: false, error: 'Failed to process medical document.' };
  }
}
