'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, LogOut } from 'lucide-react';

import { OnboardingFlow } from '@/components/onboarding-flow';
import { WorkoutDisplay } from '@/components/workout-display';
import { Dashboard } from '@/components/dashboard';
import { useToast } from '@/hooks/use-toast';
import { generateWorkoutPlanAction } from '@/lib/actions';
import { parseWorkoutPlan } from '@/lib/parsers';
import type { UserProfile, WorkoutPlan, SavedPlan } from '@/lib/types';
import useLocalStorage from '@/hooks/use-local-storage';
import { useAuth, signOut } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type AppStatus = 'loading' | 'onboarding' | 'generating' | 'reviewing' | 'tracking';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>('loading');
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Use a user-specific key for local storage
  const [savedPlan, setSavedPlan] = useLocalStorage<SavedPlan | null>(
    user ? `health-journey-plan-${user.uid}` : 'health-journey-plan', null
  );
  
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user) { // Only run this if the user is loaded
        if (savedPlan) {
            setStatus('tracking');
        } else {
            setStatus('onboarding');
        }
    }
  }, [savedPlan, user]);


  const handleOnboardingSubmit = async (profile: UserProfile) => {
    setUserProfile(profile);
    setStatus('generating');
    const response = await generateWorkoutPlanAction(profile);

    if (response.success && response.data) {
      const parsedPlan = parseWorkoutPlan(response.data);
      setGeneratedPlan(parsedPlan);
      setStatus('reviewing');
    } else {
      toast({
        title: 'Generation Failed',
        description: response.error || 'Could not generate a workout plan. Please try again.',
        variant: 'destructive',
      });
      setStatus('onboarding');
    }
  };

  const handleSavePlan = () => {
    if (generatedPlan && userProfile) {
      setSavedPlan({
        plan: generatedPlan,
        profile: userProfile,
        completedExercises: {},
      });
      setStatus('tracking');
    }
  };

  const handleDiscardPlan = () => {
    setGeneratedPlan(null);
    setUserProfile(null);
    setStatus('onboarding');
  };

  const handleUpdateProgress = (dayIndex: number, exerciseIndex: number, completed: boolean) => {
    if (!savedPlan) return;
    const newProgress = { ...savedPlan.completedExercises };
    if (!newProgress[dayIndex]) {
        newProgress[dayIndex] = {};
    }
    newProgress[dayIndex][exerciseIndex] = completed;
    setSavedPlan({ ...savedPlan, completedExercises: newProgress });
  };
  
  const handleGenerateNew = () => {
    setSavedPlan(null);
    handleDiscardPlan();
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader text="Loading Your Journey..." />
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <Dumbbell className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline">Health Journey</h1>
      </div>
      <div className="absolute top-8 right-8">
        <Button variant="ghost" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={status}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="w-full flex justify-center"
          >
            {status === 'loading' && <Loader text="Loading Your Journey..." />}
            {status === 'onboarding' && <OnboardingFlow onSubmit={handleOnboardingSubmit} isGenerating={false} />}
            {status === 'generating' && <Loader text="Crafting your personalized plan..." />}
            {status === 'reviewing' && generatedPlan && (
              <WorkoutDisplay plan={generatedPlan} onSave={handleSavePlan} onDiscard={handleDiscardPlan} />
            )}
            {status === 'tracking' && savedPlan && (
                <Dashboard savedPlan={savedPlan} onUpdateProgress={handleUpdateProgress} onGenerateNew={handleGenerateNew} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

function Loader({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <motion.div
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Dumbbell className="h-20 w-20 text-primary" />
      </motion.div>
      <p className="text-xl font-semibold text-muted-foreground mt-4 tracking-wider">{text}</p>
    </div>
  );
}
