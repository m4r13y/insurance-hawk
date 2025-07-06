
"use client";

import { useState, useEffect, useTransition } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from '@/components/ui/skeleton';
import { getExplanation } from './actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

const topics = [
    { id: 'topic-1', title: 'Original Medicare vs. Medicare Advantage', query: 'Original Medicare vs. Medicare Advantage, Supplements, and Part D' },
    { id: 'topic-2', title: 'Comparing Supplement Plans: Plan G vs. Plan N', query: 'Compare Medicare Supplement Plan G and Plan N' },
    { id: 'topic-3', title: 'Comparing Network Types: HMO vs. PPO', query: 'Compare PPO and HMO plan types' },
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

      <Accordion type="single" collapsible className="w-full" defaultValue={topics[0].id}>
        {topics.map(topic => (
            <AccordionItem value={topic.id} key={topic.id}>
                <AccordionTrigger className="text-left hover:no-underline">{topic.title}</AccordionTrigger>
                <AccordionContent>
                    <Explanation topicQuery={topic.query} />
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
