
"use client";

import { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Send, Phone, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { getExplanation } from './actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';


// Chatbot specific types and data
type Message = {
    role: 'user' | 'assistant';
    content: string;
};

const starterPrompts = [
    'What is the difference between Medicare Part A and Part B?',
    'Explain Medicare Advantage plans.',
    'How do I qualify for a Medigap policy?',
    'What are the late enrollment penalties?',
];

// Reusable markdown component for chat content
function ChatMarkdownContent({ text }: { text: string }) {
    return (
        <div className="prose prose-sm max-w-none text-card-foreground">
            {text.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('## ')) {
                    return <h3 key={index} className="font-headline text-lg font-semibold mt-4 mb-2">{trimmedLine.substring(3)}</h3>;
                }
                if (trimmedLine.startsWith('* ')) {
                    return <li key={index} className="ml-5 list-disc">{trimmedLine.substring(2)}</li>;
                }
                if (trimmedLine.includes('**Disclaimer:**')) {
                    return (
                        <div key={index} className="mt-4 p-3 rounded-lg border border-amber-300 bg-amber-50/50 text-amber-800">
                             <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-semibold">Important Disclaimer</span>
                            </div>
                            <p className="mt-1 text-xs">{trimmedLine.replace('**Disclaimer:**', '')}</p>
                        </div>
                    );
                }
                if (trimmedLine === '') {
                    return null;
                }
                return <p key={index} className="text-muted-foreground">{trimmedLine}</p>;
            })}
        </div>
    );
}

// The Chatbot Component
function Chatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isPending, startTransition] = useTransition();
    const scrollAreaContentRef = useRef<HTMLDivElement>(null);
    const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const viewport = scrollAreaViewportRef.current;
        if (viewport) {
            viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = (messageContent?: string) => {
        const content = (messageContent || input).trim();
        if (!content) return;

        const newUserMessage: Message = { role: 'user', content };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');

        startTransition(async () => {
            const result = await getExplanation(content);
            const aiResponse: Message = {
                role: 'assistant',
                content: result.explanation || result.error || 'An unexpected error occurred.',
            };
            setMessages(prev => [...prev, aiResponse]);
        });
    };

    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Medicare Assistant</CardTitle>
                    <CardDescription>Your AI-powered guide to Medicare questions.</CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/settings">
                        <Phone className="mr-2 h-4 w-4" />
                        Contact Us
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                    <div className="p-6 space-y-4" ref={scrollAreaContentRef}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                 <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                    <Sparkles className="h-8 w-8" />
                                </div>
                                <h3 className="text-xl font-semibold">Welcome to the Medicare Assistant!</h3>
                                <p className="text-muted-foreground mt-2">Ask a question or try one of the prompts below.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-6 w-full max-w-2xl">
                                    {starterPrompts.map(prompt => (
                                        <Button
                                            key={prompt}
                                            variant="outline"
                                            className="text-left justify-start h-auto py-2 whitespace-normal"
                                            onClick={() => handleSendMessage(prompt)}
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : '')}>
                                    {message.role === 'assistant' && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback><Bot /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn('max-w-[85%] rounded-lg p-3 text-sm', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                        <ChatMarkdownContent text={message.content} />
                                    </div>
                                     {message.role === 'user' && (
                                        <Avatar className="h-8 w-8">
                                             <AvatarFallback><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            ))
                        )}
                        {isPending && (
                             <div className="flex items-start gap-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin"/>
                                    <span className="text-sm text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-6 border-t">
                <form
                    className="flex w-full items-center space-x-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <Input
                        id="message"
                        placeholder="Ask about Medicare plans, costs, or eligibility..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

// Main page component
export default function EducationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold">Medicare Education Center</h1>
        <p className="text-muted-foreground">Understand your Medicare options with our AI-powered chatbot.</p>
      </div>
      <Chatbot />
    </div>
  )
}
