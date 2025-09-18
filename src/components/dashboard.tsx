'use client';

import type { SavedPlan } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

interface DashboardProps {
    savedPlan: SavedPlan;
    onUpdateProgress: (dayIndex: number, exerciseIndex: number, completed: boolean) => void;
    onGenerateNew: () => void;
}

function getExerciseImage(exerciseName: string) {
    const normalizedName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundImage = PlaceHolderImages.find(img => normalizedName.includes(img.id));
    return foundImage || PlaceHolderImages.find(img => img.id === 'default')!;
}

export function Dashboard({ savedPlan, onUpdateProgress, onGenerateNew }: DashboardProps) {

    const { plan, completedExercises } = savedPlan;

    const { progressPercentage, totalExercises } = useMemo(() => {
        let completedCount = 0;
        let totalCount = 0;
        plan.days.forEach((day, dayIndex) => {
            totalCount += day.exercises.length;
            day.exercises.forEach((_, exerciseIndex) => {
                if (completedExercises?.[dayIndex]?.[exerciseIndex]) {
                    completedCount++;
                }
            });
        });

        if (totalCount === 0) return { progressPercentage: 0, totalExercises: 0 };
        return { progressPercentage: (completedCount / totalCount) * 100, totalExercises: totalCount };
    }, [plan, completedExercises]);


    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-headline">{plan.title}</CardTitle>
                <CardDescription>Your saved plan. Keep up the great work!</CardDescription>
                 <div className="pt-4">
                    <Progress value={progressPercentage} className="w-full" />
                    <p className="text-sm text-muted-foreground mt-2">{Math.round(progressPercentage)}% complete</p>
                </div>
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
                                        const isCompleted = completedExercises?.[dayIndex]?.[exerciseIndex] || false;
                                        return (
                                            <div key={exerciseIndex} className={`p-4 border rounded-lg flex flex-col md:flex-row gap-4 transition-colors ${isCompleted ? 'bg-green-100/50 dark:bg-green-900/20' : 'bg-background/50'}`}>
                                                <div className="md:w-1/3">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            id={`exercise-${dayIndex}-${exerciseIndex}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => onUpdateProgress(dayIndex, exerciseIndex, !!checked)}
                                                        />
                                                        <label htmlFor={`exercise-${dayIndex}-${exerciseIndex}`} className={`font-semibold text-lg cursor-pointer ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                            {exercise.name}
                                                        </label>
                                                    </div>
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
            <CardFooter>
                 <Button variant="outline" onClick={onGenerateNew} className="mx-auto">
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate New Plan
                 </Button>
            </CardFooter>
        </Card>
    );
}
