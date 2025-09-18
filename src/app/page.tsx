'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, LogOut, User, UserPlus, Loader2 } from 'lucide-react';

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
} from "@/components/ui/alert-dialog"

type AppStatus = 'loading' | 'onboarding' | 'generating' | 'reviewing' | 'tracking';

export default function Home() {
  const { user, loading, isGuest } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<AppStatus>('loading');
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const localStorageKey = user ? `health-journey-plan-${user.uid}` : 'health-journey-plan-guest';
  const [savedPlan, setSavedPlan] = useLocalStorage<SavedPlan | null>(localStorageKey, null);
  
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // We only want to run this effect when the user object is available
    if (loading) {
      setStatus('loading');
      return;
    }
    
    if (user) {
        if (savedPlan) {
            setStatus('tracking');
        } else {
            setStatus('onboarding');
        }
    } else {
        // This case handles when the user signs out.
        // The other useEffect will redirect to /login.
        setStatus('loading');
    }
  }, [savedPlan, user, loading]);


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
      if (isGuest) {
        toast({
            title: "Guest Mode",
            description: "Sign up to save your progress permanently.",
        })
      }
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
    setSavedPlan(null); // This will trigger the useEffect to go back to onboarding
    setGeneratedPlan(null);
    setUserProfile(null);
  };

  const handleSignOut = async () => {
    await signOut();
    setSavedPlan(null); // Clear local storage on sign out
    // The useEffect hook will handle the redirect to /login
  };

  const handleSignUp = () => {
    // If a guest signs up, we want to clear their local data
    // so they start fresh after creating an account.
    setSavedPlan(null);
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
