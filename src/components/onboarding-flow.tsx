'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, FileUp, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { extractMedicalConditionsAction } from '@/lib/actions';
import type { UserProfile } from '@/lib/types';
import { Badge } from './ui/badge';

const formSchema = z.object({
  age: z.coerce.number().min(18, 'Must be at least 18').max(100, 'Please enter a valid age'),
  sex: z.enum(['male', 'female', 'other'], { required_error: 'Please select your sex.' }),
  height: z.coerce.number().min(100, 'Height must be in cm').max(250, 'Please enter a valid height'),
  weight: z.coerce.number().min(30, 'Weight must be in kg').max(300, 'Please enter a valid weight'),
  hasMedicalHistory: z.enum(['yes', 'no'], { required_error: 'Please select an option.' }),
  medicalHistoryText: z.string().optional(),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced'], { required_error: 'Please select your fitness level.' }),
  workoutHistory: z.string().min(10, 'Please describe your workout history briefly.').max(500),
});

interface OnboardingFlowProps {
  onSubmit: (data: UserProfile) => void;
  isGenerating: boolean;
}

export function OnboardingFlow({ onSubmit, isGenerating }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedConditions, setExtractedConditions] = useState<string[]>([]);
  
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 18,
      sex: undefined,
      height: 170,
      weight: 70,
      hasMedicalHistory: undefined,
      medicalHistoryText: '',
      fitnessLevel: undefined,
      workoutHistory: '',
    },
  });

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const handleNext = async () => {
    const fieldsByStep: (keyof z.infer<typeof formSchema>)[][] = [
      ['age', 'sex', 'height', 'weight'],
      ['fitnessLevel', 'workoutHistory'],
      ['hasMedicalHistory'],
    ];
    
    if (form.getValues('hasMedicalHistory') === 'yes') {
      fieldsByStep[2].push('medicalHistoryText');
    }

    const currentFields = fieldsByStep[step] || [];
    const isValid = await form.trigger(currentFields as any);
    
    if (isValid) {
      setDirection(1);
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setMedicalFile(file);
      setIsExtracting(true);
      setExtractedConditions([]);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const base64 = reader.result as string;
          const response = await extractMedicalConditionsAction(base64);
          if (response.success && response.data) {
            const conditionsText = response.data.join(', ');
            form.setValue('medicalHistoryText', `Uploaded document contains: ${conditionsText}`);
            setExtractedConditions(response.data);
            toast({ title: "Document processed successfully." });
          } else {
            form.setValue('medicalHistoryText', 'Could not automatically extract conditions. Please describe them manually.');
            toast({ title: "Error processing document", description: response.error, variant: 'destructive' });
          }
          setIsExtracting(false);
        };
      } catch (error) {
        setIsExtracting(false);
        toast({ title: 'Error uploading file', description: 'Please try again.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Invalid file type', description: 'Please upload a PDF file.', variant: 'destructive' });
    }
  };


  const onFinalSubmit: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    const profileData: UserProfile = {
        age: data.age,
        sex: data.sex,
        height: data.height,
        weight: data.weight,
        hasMedicalHistory: data.hasMedicalHistory,
        medicalHistoryText: data.hasMedicalHistory === 'yes' ? data.medicalHistoryText : 'No specific conditions reported.',
        fitnessLevel: data.fitnessLevel,
        workoutHistory: data.workoutHistory,
    };
    onSubmit(profileData);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };
  
  if (isGenerating) {
      return (
          <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Loader2 className="h-20 w-20 text-primary animate-spin" />
              </motion.div>
              <p className="text-xl font-semibold text-muted-foreground mt-4 tracking-wider">Crafting your personalized plan...</p>
            </div>
      );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center tracking-tighter">Your Health Journey</CardTitle>
        <CardDescription className="text-center text-lg">Let's create a workout plan tailored just for you.</CardDescription>
        <Progress value={progress} className="mt-4 h-3" />
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onFinalSubmit)} className="h-[480px] flex flex-col">
          <CardContent className="flex-grow">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="h-full"
              >
                {step === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sex" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sex</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="male" /></FormControl><FormLabel className="font-normal">Male</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="female" /></FormControl><FormLabel className="font-normal">Female</FormLabel></FormItem>
                            <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="height" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height (cm)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 175" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="weight" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 70" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
                {step === 1 && (
                   <div className="space-y-6">
                     <FormField control={form.control} name="fitnessLevel" render={({ field }) => (
                       <FormItem>
                         <FormLabel>Current Fitness Level</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="Select your fitness level" /></SelectTrigger></FormControl>
                           <SelectContent>
                             <SelectItem value="beginner">Beginner</SelectItem>
                             <SelectItem value="intermediate">Intermediate</SelectItem>
                             <SelectItem value="advanced">Advanced</SelectItem>
                           </SelectContent>
                         </Select>
                         <FormMessage />
                       </FormItem>
                     )} />
                     <FormField control={form.control} name="workoutHistory" render={({ field }) => (
                       <FormItem>
                         <FormLabel>Workout History</FormLabel>
                         <FormControl><Textarea placeholder="e.g., 'I go to the gym 2-3 times a week and do a mix of cardio and weights.' or 'I walk my dog for 30 minutes daily.'" {...field} /></FormControl>
                         <FormMessage />
                       </FormItem>
                     )} />
                   </div>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                     <FormField control={form.control} name="hasMedicalHistory" render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Do you have any pre-existing medical conditions, injuries, or have you had recent surgeries?</FormLabel>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="no" /></FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl><RadioGroupItem value="yes" /></FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      {form.watch('hasMedicalHistory') === 'yes' && (
                         <FormField control={form.control} name="medicalHistoryText" render={({ field }) => (
                          <FormItem>
                             <FormLabel>Please provide details</FormLabel>
                              <div className="flex items-center gap-2">
                                <Button asChild variant="outline" className="w-auto">
                                  <label htmlFor="medical-doc" className="cursor-pointer flex items-center gap-2">
                                    <FileUp className="h-4 w-4" /> Upload PDF
                                  </label>
                                </Button>
                                <Input id="medical-doc" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isExtracting}/>
                                {isExtracting && <Loader2 className="h-4 w-4 animate-spin" />}
                                {medicalFile && !isExtracting && <span className="text-sm text-muted-foreground">{medicalFile.name}</span>}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {extractedConditions.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                              </div>
                             <FormControl><Textarea placeholder="Describe your conditions, or we'll use the info from your uploaded PDF." {...field} /></FormControl>
                             <FormMessage />
                          </FormItem>
                         )} />
                      )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
          <CardFooter className="flex justify-between">
            {step > 0 ? (
              <Button type="button" variant="ghost" onClick={handleBack} disabled={isGenerating}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : <div />}
            {step < totalSteps -1 ? (
              <Button type="button" onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan</>) : (<>Get My Plan <Check className="ml-2 h-4 w-4" /></>)}
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
