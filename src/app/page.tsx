'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, LogOut, User, UserPlus, Loader2 } from 'lucide-react';

import { OnboardingFlow } from '@/components/onboarding-flow';
import { WorkoutDisplay } from '@/components/workout-display';
import { useToast } from '@/hooks/use-toast';
import { generateWorkoutPlanAction } from '@/lib/actions';
import { parseWorkoutPlan } from '@/lib/parsers';
import type { UserProfile, WorkoutPlan, SavedPlan } from '@/lib/types';
import { useAuth, signOut } from '@/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dashboard } from '@/components/dashboard';
import useLocalStorage from '@/hooks/use-local-storage';

type AppStatus = 'loading' | 'onboarding' | 'generating' | 'reviewing' | 'dashboard';

export default function Home() {
  const { user, loading, isGuest } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>('loading');
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [savedPlan, setSavedPlan] = useLocalStorage<SavedPlan | null>('workout-plan', null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (loading) {
      setStatus('loading');
      return;
    }
    
    if (user) {
      if (savedPlan) {
        setStatus('dashboard');
      } else {
        setStatus('onboarding');
      }
    }
  }, [user, loading, savedPlan]);


  const handleOnboardingSubmit = async (profile: UserProfile) => {
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
    if (generatedPlan) {
      setSavedPlan({ plan: generatedPlan, completedExercises: {} });
      setStatus('dashboard');
    }
  };
  
  const handleUpdateProgress = (dayIndex: number, exerciseIndex: number, completed: boolean) => {
    setSavedPlan(prev => {
        if (!prev) return null;
        const newCompleted = { ...prev.completedExercises };
        if (!newCompleted[dayIndex]) {
            newCompleted[dayIndex] = {};
        }
        newCompleted[dayIndex][exerciseIndex] = completed;
        return { ...prev, completedExercises: newCompleted };
    });
  };

  const handleSignOut = async () => {
    await signOut();
    setSavedPlan(null);
    // The useEffect hook will handle the redirect to /login
  };
  
  const handleGenerateNew = () => {
    setSavedPlan(null);
    setGeneratedPlan(null);
    setStatus('onboarding');
  };

  const handleSignUp = () => {
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
      <div className="absolute top-8 right-8 flex items-center gap-2">
        {isGuest ? (
          <>
            <Button variant="ghost" onClick={handleSignUp}>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Guest
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>You are browsing as a guest.</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your workout plan is saved locally on this device. Sign up to save your progress and access it from anywhere.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue as Guest</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignUp}>Sign Up</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        )}
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
            {status === 'generating' && <OnboardingFlow onSubmit={handleOnboardingSubmit} isGenerating={true} />}
            {status === 'reviewing' && generatedPlan && (
              <WorkoutDisplay plan={generatedPlan} onStartOver={handleGenerateNew} onSavePlan={handleSavePlan} />
            )}
             {status === 'dashboard' && savedPlan && (
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
