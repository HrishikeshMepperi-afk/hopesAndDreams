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
import { motion } from "framer-motion";

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
        <Card className="w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="text-center">
                <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}}>
                    <CardTitle className="text-4xl font-headline tracking-tighter">{plan.title}</CardTitle>
                    <CardDescription className="text-lg">Your journey continues. Keep up the great work!</CardDescription>
                </motion.div>
                 <div className="pt-6">
                    <Progress value={progressPercentage} className="w-full h-3" />
                    <p className="text-sm text-muted-foreground mt-2 font-semibold">{Math.round(progressPercentage)}% complete</p>
                </div>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {plan.days.map((day, dayIndex) => (
                        <AccordionItem value={`item-${dayIndex}`} key={dayIndex} className="border-primary/10">
                            <AccordionTrigger className="text-2xl font-semibold font-headline hover:text-primary transition-colors">
                                <span className="flex items-center gap-3">{day.day}: {day.title}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                                <motion.div 
                                    className="space-y-4"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{staggerChildren: 0.1}}
                                >
                                    {day.exercises.map((exercise, exerciseIndex) => {
                                        const img = getExerciseImage(exercise.name);
                                        const isCompleted = completedExercises?.[dayIndex]?.[exerciseIndex] || false;
                                        return (
                                            <motion.div 
                                                key={exerciseIndex} 
                                                className={`p-4 border rounded-lg flex flex-col md:flex-row gap-6 transition-all duration-300 ${isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-background/50 border-transparent'}`}
                                                layout
                                            >
                                                <div className="md:w-1/3">
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            id={`exercise-${dayIndex}-${exerciseIndex}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => onUpdateProgress(dayIndex, exerciseIndex, !!checked)}
                                                            className="h-5 w-5 rounded"
                                                        />
                                                        <label htmlFor={`exercise-${dayIndex}-${exerciseIndex}`} className={`font-semibold text-xl cursor-pointer transition-all ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                            {exercise.name}
                                                        </label>
                                                    </div>
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
            <CardFooter>
                 <Button variant="outline" onClick={onGenerateNew} className="mx-auto border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                    <RefreshCw className="mr-2 h-4 w-4" /> Generate New Plan
                 </Button>
            </CardFooter>
        </Card>
    );
}
