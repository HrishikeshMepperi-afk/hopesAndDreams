'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { WorkoutPlan } from "@/lib/types";
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkoutDisplayProps {
  plan: WorkoutPlan;
  onSave: () => void;
  onDiscard: () => void;
}

function getExerciseImage(exerciseName: string) {
    const normalizedName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundImage = PlaceHolderImages.find(img => normalizedName.includes(img.id));
    return foundImage || PlaceHolderImages.find(img => img.id === 'default')!;
}


export function WorkoutDisplay({ plan, onSave, onDiscard }: WorkoutDisplayProps) {
  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
      <CardHeader className="text-center">
        <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}}>
            <CardTitle className="text-4xl font-headline tracking-tighter">{plan.title}</CardTitle>
            <CardDescription className="text-lg">Here is your personalized plan. Review it and save it to start tracking.</CardDescription>
        </motion.div>
      </CardHeader>
      <CardContent>
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
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const img = getExerciseImage(exercise.name);
                    return (
                        <motion.div 
                            key={exerciseIndex} 
                            className="p-4 border rounded-lg bg-background/50 flex flex-col md:flex-row gap-6"
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                        >
                            <div className="md:w-1/3">
                                <h4 className="font-semibold text-xl">{exercise.name}</h4>
                                <div className="mt-3 space-y-1 text-md text-muted-foreground">
                                    {exercise.sets && <p><strong>Sets:</strong> {exercise.sets}</p>}
                                    {exercise.reps && <p><strong>Reps:</strong> {exercise.reps}</p>}
                                    {exercise.rest && <p><strong>Rest:</strong> {exercise.rest}</p>}
                                </div>
                                {exercise.tips && (
                                    <div className="mt-3 p-3 bg-accent/10 border-l-4 border-accent rounded-r-lg">
                                        <p className="text-sm text-accent-foreground/80 font-semibold">Tip: <span className="font-normal">{exercise.tips}</span></p>
                                    </div>
                                )}
                            </div>
                            <div className="md:w-2/3 flex-shrink-0 relative overflow-hidden rounded-lg shadow-md">
                                <Image
                                    src={img.imageUrl}
                                    alt={`Demonstration of ${exercise.name}`}
                                    width={600}
                                    height={400}
                                    className="object-cover w-full h-auto aspect-video transform hover:scale-105 transition-transform duration-300"
                                    data-ai-hint={img.imageHint}
                                />
                            </div>
                        </motion.div>
                    )
                  })}
                </motion.div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex justify-center gap-4">
        <Button size="lg" onClick={onSave}><Check className="mr-2 h-4 w-4" /> Save and Start</Button>
        <Button size="lg" variant="outline" onClick={onDiscard}><X className="mr-2 h-4 w-4" /> Discard and Restart</Button>
      </CardFooter>
    </Card>
  );
}
