'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutPlan } from "@/lib/types";
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
  onStartOver: () => void;
  onSavePlan: () => void;
}

export function WorkoutDisplay({ plan, onStartOver, onSavePlan }: WorkoutDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader className="text-center">
        <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}}>
            <CardTitle className="text-4xl font-headline tracking-tighter">{plan.title}</CardTitle>
            <CardDescription className="text-lg">Here is your personalized plan. Review it carefully.</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-yellow-900/30 border-yellow-700/50 text-yellow-300 [&>svg]:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">Important Disclaimer</AlertTitle>
          <AlertDescription>
            This workout plan is AI-generated. Always consult with a qualified healthcare professional or certified personal trainer before starting any new fitness program.
          </AlertDescription>
        </Alert>

        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {plan.days.map((day, dayIndex) => (
            <AccordionItem value={`item-${dayIndex}`} key={dayIndex} className="border-primary/10">
              <AccordionTrigger className="text-2xl font-semibold font-headline hover:text-primary transition-colors">{day.day}: {day.title}</AccordionTrigger>
              <AccordionContent>
                <motion.div 
                    className="space-y-4"
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{staggerChildren: 0.1}}
                >
                  {day.exercises.map((exercise, exerciseIndex) => (
                      <motion.div 
                          key={exerciseIndex} 
                          className="p-4 border rounded-lg bg-background/50"
                          initial={{opacity: 0, y: 10}}
                          animate={{opacity: 1, y: 0}}
                      >
                          <h4 className="font-semibold text-xl">{exercise.name}</h4>
                          <div className="mt-1 space-x-4 text-md text-muted-foreground">
                              {exercise.sets && <span><strong>Sets:</strong> {exercise.sets}</span>}
                              {exercise.reps && <span><strong>Reps:</strong> {exercise.reps}</span>}
                              {exercise.rest && <span><strong>Rest:</strong> {exercise.rest}</span>}
                          </div>
                          {exercise.tips && (
                              <div className="mt-3 p-3 bg-accent/10 border-l-4 border-accent rounded-r-lg">
                                  <p className="text-sm text-accent-foreground/80 font-semibold">Tip: <span className="font-normal">{exercise.tips}</span></p>
                              </div>
                          )}
                      </motion.div>
                  ))}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button size="lg" variant="outline" onClick={onStartOver}><RefreshCw className="mr-2 h-4 w-4" /> Start Over</Button>
        <Button size="lg" onClick={onSavePlan}><Save className="mr-2 h-4 w-4" /> Save & Start</Button>
      </CardFooter>
    </Card>
  );
}
