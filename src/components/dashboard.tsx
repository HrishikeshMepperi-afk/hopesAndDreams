'use client';

import type { SavedPlan } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { useMemo } from "react";
import { RefreshCw, Dumbbell, PersonStanding, HeartPulse, Brain, Zap, Weight, Bike, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface DashboardProps {
    savedPlan: SavedPlan;
    onUpdateProgress: (dayIndex: number, exerciseIndex: number, completed: boolean) => void;
    onGenerateNew: () => void;
}

const exerciseIconMap: { [key: string]: React.ElementType } = {
    'push-up': HeartPulse,
    'squat': PersonStanding,
    'plank': PersonStanding,
    'jumping jack': Zap,
    'lunge': PersonStanding,
    'deadlift': Weight,
    'bench press': Weight,
    'running': Bike,
    'cycling': Bike,
    'yoga': Brain,
    'stretch': PersonStanding,
    'dumbbell': Dumbbell,
};

const getExerciseIcon = (exerciseName: string) => {
    const lowerCaseName = exerciseName.toLowerCase();
    for (const keyword in exerciseIconMap) {
        if (lowerCaseName.includes(keyword)) {
            return exerciseIconMap[keyword];
        }
    }
    return Dumbbell;
};

export function Dashboard({ savedPlan, onUpdateProgress, onGenerateNew }: DashboardProps) {
    const { plan, completedExercises } = savedPlan;

    const { progressPercentage, chartData } = useMemo(() => {
        let completedCount = 0;
        let totalCount = 0;
        
        const data = plan.days.map((day, dayIndex) => {
            const total = day.exercises.length;
            const completed = day.exercises.reduce((acc, _, exerciseIndex) => {
                return completedExercises?.[dayIndex]?.[exerciseIndex] ? acc + 1 : acc;
            }, 0);
            totalCount += total;
            completedCount += completed;
            return {
                name: day.day,
                completed,
                total,
            };
        });

        const percentage = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
        
        return { progressPercentage: percentage, chartData: data };
    }, [plan, completedExercises]);

    const chartConfig = {
      completed: {
        label: "Completed",
        color: "hsl(var(--primary))",
      },
    } satisfies import("./ui/chart").ChartConfig;

    const handleWatchTutorial = (exerciseName: string) => {
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' exercise tutorial')}`;
        window.open(youtubeSearchUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <Card className="w-full max-w-6xl mx-auto bg-card/80 backdrop-blur-sm border-primary/20 shadow-lg">
            <CardHeader className="text-center">
                <motion.div initial={{y: -20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}}>
                    <CardTitle className="text-4xl font-headline tracking-tighter">{plan.title}</CardTitle>
                    <CardDescription className="text-lg">Your journey continues. Keep up the great work!</CardDescription>
                </motion.div>
                <div className="pt-6">
                    <p className="text-sm text-muted-foreground mt-2 font-semibold">{Math.round(progressPercentage)}% Complete</p>
                    <Progress value={progressPercentage} className="w-full h-3" />
                </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
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
                                            const isCompleted = completedExercises?.[dayIndex]?.[exerciseIndex] || false;
                                            const Icon = getExerciseIcon(exercise.name);
                                            return (
                                                <motion.div 
                                                    key={exerciseIndex} 
                                                    className={`p-4 border rounded-lg flex items-start sm:items-center gap-4 transition-all duration-300 flex-col sm:flex-row ${isCompleted ? 'bg-primary/10 border-primary/30' : 'bg-background/50 border-transparent'}`}
                                                    layout
                                                >
                                                    <div className="flex items-center justify-center">
                                                         <Checkbox
                                                            id={`exercise-${dayIndex}-${exerciseIndex}`}
                                                            checked={isCompleted}
                                                            onCheckedChange={(checked) => onUpdateProgress(dayIndex, exerciseIndex, !!checked)}
                                                            className="h-6 w-6 rounded-md"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor={`exercise-${dayIndex}-${exerciseIndex}`} className={`font-semibold text-xl cursor-pointer transition-all ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                                            {exercise.name}
                                                        </label>
                                                        <div className="mt-1 space-x-4 text-md text-muted-foreground">
                                                            {exercise.sets && <span><strong>Sets:</strong> {exercise.sets}</span>}
                                                            {exercise.reps && <span><strong>Reps:</strong> {exercise.reps}</span>}
                                                            {exercise.rest && <span><strong>Rest:</strong> {exercise.rest}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleWatchTutorial(exercise.name)}>
                                                            <Youtube className="mr-2 h-4 w-4" /> Watch
                                                        </Button>
                                                        <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10">
                                                            <motion.div
                                                                animate={{ scale: [1, 1.1, 1] }}
                                                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                                            >
                                                                <Icon className="h-8 w-8 text-primary" />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </motion.div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
                 <div className="lg:col-span-1 flex flex-col gap-8">
                     <Card>
                         <CardHeader>
                             <CardTitle>Weekly Progress</CardTitle>
                             <CardDescription>Your completed exercises per day.</CardDescription>
                         </CardHeader>
                         <CardContent>
                             <ChartContainer config={chartConfig} className="w-full h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                        <YAxis tickLine={false} axisLine={false}/>
                                        <Tooltip 
                                            cursor={{fill: 'hsl(var(--background))'}}
                                            content={<ChartTooltipContent 
                                                formatter={(value, name, item) => (
                                                  <div className="flex flex-col">
                                                      <span>{item.payload.name}</span>
                                                      <span>Completed: {value} / {item.payload.total}</span>
                                                  </div>
                                                )}
                                            />}
                                        />
                                        <Legend />
                                        <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                         </CardContent>
                     </Card>
                    <Button variant="outline" onClick={onGenerateNew} className="w-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                        <RefreshCw className="mr-2 h-4 w-4" /> Generate New Plan
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
