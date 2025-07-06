
"use client";

import { useState, useEffect, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { getExplanation } from './actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Terminal, BookCopy, GitCompare, Scale } from 'lucide-react';
import { PlanComparisonTool } from './plan-comparison-tool';

const topics = [
    { 
        id: 'topic-1', 
        title: 'Original Medicare vs. Medicare Advantage', 
        query: 'Original Medicare vs. Medicare Advantage, Supplements, and Part D',
        icon: GitCompare
    },
    { 
        id: 'topic-2', 
        title: 'Comparing Supplement Plans: G vs. N', 
        query: 'Compare Medicare Supplement Plan G and Plan N',
        icon: Scale
    },
    { 
        id: 'topic-3', 
        title: 'Comparing Network Types: HMO vs. PPO', 
        query: 'Compare PPO and HMO plan types',
        icon: BookCopy
    },
];

function MarkdownContent({ text }: { text: string }) {
    return (
        <div className="space-y-2 py-4 text-sm leading-relaxed text-muted-foreground">
            {text.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('## ')) {
                    return <h3 key={index} className="font-headline text-lg font-semibold mt-4 mb-2 text-card-foreground">{trimmedLine.substring(3)}</h3>;
                }
                if (trimmedLine.startsWith('* ')) {
                    return <li key={index} className="ml-5 list-disc">{trimmedLine.substring(2)}</li>;
                }
                if (trimmedLine === '') {
                    return null; // Don't render empty lines as <p>
                }
                return <p key={index}>{trimmedLine}</p>;
            })}
        </div>
    );
}


function Explanation({ topicQuery }: { topicQuery: string }) {
    const [isPending, startTransition] = useTransition();
    const [content, setContent] = useState<{explanation?: string; error?: string} | null>(null);
    
    useEffect(() => {
        if (!content) {
            startTransition(async () => {
                const result = await getExplanation(topicQuery);
                setContent(result);
            });
        }
    }, [topicQuery, content]);

    if (isPending || !content) {
        return (
            <div className="space-y-4 py-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        );
    }
    
    if (content.error) {
        return (
            <Alert variant="destructive" className="my-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{content.error}</AlertDescription>
            </Alert>
        )
    }

    return <MarkdownContent text={content.explanation || ''} />;
}

export default function EducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Medicare Education Center</h1>
        <p className="text-muted-foreground">Understand your Medicare options with these simple guides.</p>
      </div>

       <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topics">Learning Center</TabsTrigger>
            <TabsTrigger value="comparison">Plan Comparison Tool</TabsTrigger>
        </TabsList>
        <TabsContent value="topics" className="mt-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {topics.map(topic => (
                    <Card key={topic.id} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <topic.icon className="h-6 w-6"/>
                            </div>
                            <CardTitle className="text-lg">{topic.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <Explanation topicQuery={topic.query} />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="comparison" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Side-by-Side Plan Comparison</CardTitle>
                    <CardDescription>Select up to three plans to compare their features and costs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <PlanComparisonTool />
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
