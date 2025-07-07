"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { searchProviders } from '@/app/dashboard/health-quotes/actions';
import type { Provider } from '@/types';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2 } from 'lucide-react';

export default function ApiTestPage() {
    const [query, setQuery] = useState('');
    // Hardcoding ZIP for focused testing as requested
    const [zipCode, setZipCode] = useState('76116'); 
    const [debouncedQuery] = useDebounce(query, 500);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);

    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setProviders([]);
            return;
        }

        const fetchProviders = async () => {
            setLoading(true);
            const result = await searchProviders({ query: debouncedQuery, zipCode });
            setProviders(result.providers || []);
            setLoading(false);
        };

        fetchProviders();
    }, [debouncedQuery, zipCode]);

    const handleSelectProvider = (provider: Provider) => {
        setQuery(provider.name);
        setIsListVisible(false);
        // Optional: log to console to confirm selection since the display card is removed
        console.log("Selected Provider:", provider);
    };

    return (
        <div className="max-w-xl mx-auto py-24">
            <Command className="overflow-visible rounded-lg border shadow-md">
                <div className="relative">
                    <CommandInput
                        value={query}
                        onValueChange={(value) => {
                            setQuery(value);
                            if (value.length > 0) {
                                setIsListVisible(true);
                            } else {
                                setIsListVisible(false);
                            }
                        }}
                        onFocus={() => setIsListVisible(true)}
                        onBlur={() => setTimeout(() => setIsListVisible(false), 200)}
                        placeholder="Search for a doctor or facility..."
                        className="h-12 text-lg"
                    />
                    {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    
                    {isListVisible && (
                        <CommandList className="absolute top-full z-10 mt-1 w-full rounded-b-lg border bg-background shadow-lg">
                            {providers.length === 0 && debouncedQuery.length > 2 && !loading && (
                                <CommandEmpty>No providers found.</CommandEmpty>
                            )}
                            {providers.length > 0 && (
                                <CommandGroup>
                                    {providers.map(provider => (
                                        <CommandItem
                                            key={provider.npi}
                                            value={provider.name}
                                            onSelect={() => handleSelectProvider(provider)}
                                            className="cursor-pointer py-2 px-4"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{provider.name}</span>
                                                <span className="text-sm text-muted-foreground">{provider.specialties?.[0]} - {provider.type}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    )}
                </div>
            </Command>
        </div>
    );
}
