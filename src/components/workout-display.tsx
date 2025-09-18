'use client';

import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import type { WorkoutPlan } from "@/lib/types";
import { Check, X } from 'lucide-react';

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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-headline">{plan.title}</CardTitle>
        <CardDescription>Here is your personalized plan. Review it and save it to start tracking.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
          {plan.days.map((day, dayIndex) => (
            <AccordionItem value={`item-${dayIndex}`} key={dayIndex}>
              <AccordionTrigger className="text-lg font-semibold font-headline">{day.day}: {day.title}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const img = getExerciseImage(exercise.name);
                    return (
                        <div key={exerciseIndex} className="p-4 border rounded-lg bg-background/50 flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/3">
                                <h4 className="font-semibold text-lg">{exercise.name}</h4>
                                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                                    {exercise.sets && <p><strong>Sets:</strong> {exercise.sets}</p>}
                                    {exercise.reps && <p><strong>Reps:</strong> {exercise.reps}</p>}
                                    {exercise.rest && <p><strong>Rest:</strong> {exercise.rest}</p>}
                                </div>
                                {exercise.tips && (
                                    <div className="mt-2 p-2 bg-accent/20 border-l-4 border-accent rounded-r-md">
                                        <p className="text-xs text-accent-foreground/80 font-semibold">Tip: <span className="font-normal">{exercise.tips}</span></p>
                                    </div>
                                )}
                            </div>
                            <div className="md:w-2/3 flex-shrink-0">
                                <Image
                                    src={img.imageUrl}
                                    alt={`Demonstration of ${exercise.name}`}
                                    width={600}
                                    height={400}
                                    className="rounded-md object-cover w-full h-auto aspect-video"
                                    data-ai-hint={img.imageHint}
                                />
                            </div>
                        </div>
                    )
                  })}
                </div>
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
