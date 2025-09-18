export interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
  tips?: string;
}

export interface WorkoutDay {
  day: string;
  title: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  title: string;
  days: WorkoutDay[];
}

export type UserProfile = {
  age: number;
  sex: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  hasMedicalHistory: 'yes' | 'no';
  medicalHistoryText?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutHistory: string;
};

export interface SavedPlan {
  plan: WorkoutPlan;
  profile: UserProfile;
  completedExercises: { [dayIndex: number]: { [exerciseIndex: number]: boolean } };
}
