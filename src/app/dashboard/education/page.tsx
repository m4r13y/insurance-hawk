
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
        <div className="prose prose-sm sm:prose-base max-w-none text-card-foreground">
            {text.split('\n').map((line, index) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('## ')) {
                    return <h3 key={index} className="font-headline text-lg sm:text-xl font-semibold mt-6 mb-2">{trimmedLine.substring(3)}</h3>;
                }
                if (trimmedLine.startsWith('* ')) {
                    return <li key={index} className="ml-6 list-disc">{trimmedLine.substring(2)}</li>;
                }
                if (trimmedLine.includes('**Disclaimer:**')) {
                    const disclaimerText = trimmedLine.replace('**Disclaimer:**', '').trim();
                    return (
                        <div key={index} className="mt-6 p-3 sm:p-4 rounded-lg border border-amber-300 bg-amber-50/50 text-amber-800">
                             <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span className="font-semibold text-sm sm:text-base">Important Disclaimer</span>
                            </div>
                            {disclaimerText && <p className="mt-2 text-xs sm:text-sm">{disclaimerText}</p>}
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
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am a Medicare expert. How can I help you understand your benefits today? You can ask me a question or choose one of the prompts below.' }
    ]);
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

    const InitialPrompts = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-8">
             <div className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                <Sparkles className="h-10 w-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold">Welcome to the Medicare Assistant!</h3>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg">Ask a question or try one of the prompts below.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-3xl">
                {starterPrompts.map(prompt => (
                    <Button
                        key={prompt}
                        variant="outline"
                        className="text-left justify-start h-auto p-4 text-sm sm:text-base whitespace-normal"
                        onClick={() => handleSendMessage(prompt)}
                    >
                        {prompt}
                    </Button>
                ))}
            </div>
        </div>
    )


    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">Medicare Assistant</CardTitle>
                    <CardDescription>Your AI-powered guide to Medicare questions.</CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/dashboard/settings">
                        <Phone className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Contact Us</span>
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full" viewportRef={scrollAreaViewportRef}>
                    <div className="p-4 md:p-6 space-y-6" ref={scrollAreaContentRef}>
                        {messages.map((message, index) => (
                            <div key={index} className={cn('flex items-start gap-2 sm:gap-4', message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'assistant' && (
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                        <AvatarFallback><Bot className="h-4 w-4 sm:h-5 sm:w-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn('max-w-[85%] rounded-lg p-3 sm:p-4 text-sm sm:text-base', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <ChatMarkdownContent text={message.content} />
                                </div>
                                 {message.role === 'user' && (
                                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                                         <AvatarFallback><User className="h-4 w-4 sm:h-5 sm:w-5"/></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {messages.length === 1 && <InitialPrompts />}

                        {isPending && (
                             <div className="flex items-start gap-4">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                                <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                    <span className="text-base text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="pt-6 border-t">
                <form
                    className="flex w-full items-center space-x-2 sm:space-x-3"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }}
                >
                    <Input
                        id="message"
                        placeholder="Ask about Medicare plans, costs, or eligibility..."
                        className="flex-1 h-10 sm:h-11 text-sm sm:text-base"
                        autoComplete="off"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()} className="h-10 w-10 sm:h-11 sm:w-11">
                        <Send className="h-5 w-5" />
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
    <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-semibold">Medicare Education Center</h1>
        <p className="text-base text-muted-foreground mt-1">Understand your Medicare options with our AI-powered chatbot.</p>
      </div>
      <div className="flex-1 min-h-0">
        <Chatbot />
      </div>
    </div>
  )
}
