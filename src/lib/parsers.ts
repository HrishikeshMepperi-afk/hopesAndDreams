import type { Exercise, WorkoutDay, WorkoutPlan } from './types';

export function parseWorkoutPlan(markdown: string): WorkoutPlan {
  const lines = markdown.split('\n').filter(line => line.trim() !== '');
  const workoutPlan: WorkoutPlan = { title: 'Your Personalized Workout Plan', days: [] };
  
  let currentDay: WorkoutDay | null = null;
  let currentExercise: Exercise | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('# ')) {
      workoutPlan.title = trimmedLine.substring(2);
    } else if (trimmedLine.startsWith('## ')) {
      if (currentDay) {
        if (currentExercise) {
          currentDay.exercises.push(currentExercise);
          currentExercise = null;
        }
        workoutPlan.days.push(currentDay);
      }
      const dayMatch = trimmedLine.match(/## (Day \d+):?\s*(.*)/);
      if (dayMatch) {
        currentDay = { day: dayMatch[1], title: dayMatch[2], exercises: [] };
      }
    } else if (trimmedLine.startsWith('### ')) {
      if (currentExercise && currentDay) {
        currentDay.exercises.push(currentExercise);
      }
      currentExercise = { name: trimmedLine.substring(4) };
    } else if ((trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) && currentExercise) {
      const detail = trimmedLine.substring(2).split(':');
      const key = detail[0]?.trim().toLowerCase();
      const value = detail[1]?.trim();

      if (key && value) {
        switch (key) {
          case 'sets':
            currentExercise.sets = value;
            break;
          case 'reps':
          case 'repetitions':
            currentExercise.reps = value;
            break;
          case 'rest':
            currentExercise.rest = value;
            break;
          case 'tips':
          case 'note':
            currentExercise.tips = value;
            break;
        }
      }
    }
  }

  if (currentDay) {
    if (currentExercise) {
      currentDay.exercises.push(currentExercise);
    }
    workoutPlan.days.push(currentDay);
  }

  return workoutPlan;
}
