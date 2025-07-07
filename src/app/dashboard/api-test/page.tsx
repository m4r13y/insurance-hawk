"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { searchProviders } from '@/app/dashboard/health-quotes/actions';
import type { Provider } from '@/types';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function ApiTestPage() {
    const [query, setQuery] = useState('');
    const [zipCode, setZipCode] = useState('76116');
    const [debouncedQuery] = useDebounce(query, 500);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
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
        setSelectedProvider(provider);
        setQuery(provider.name);
        setIsListVisible(false);
    };

    return (
        <>
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Provider Search Autocomplete Test</CardTitle>
                    <CardDescription>
                        This page isolates the provider search component to debug the autocomplete functionality.
                        The search triggers automatically after you stop typing for 500ms.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                            id="zip"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="Enter a 5-digit ZIP code"
                            maxLength={5}
                            className="max-w-xs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Provider Name</Label>
                        <Command className="relative overflow-visible">
                            <div className="relative">
                                <CommandInput
                                    value={query}
                                    onValueChange={setQuery}
                                    onFocus={() => setIsListVisible(true)}
                                    onBlur={() => setTimeout(() => setIsListVisible(false), 200)}
                                    placeholder="Search for a doctor or facility..."
                                />
                                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                            </div>
                            {isListVisible && (
                                <CommandList className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
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
                                                    className="cursor-pointer"
                                                >
                                                    {provider.name}
                                                    <span className="text-xs ml-2 text-muted-foreground">{provider.specialties?.[0]}</span>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    )}
                                </CommandList>
                            )}
                        </Command>
                    </div>
                </CardContent>
            </Card>

            {selectedProvider && (
                <Card>
                    <CardHeader>
                        <CardTitle>Selected Provider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                            {JSON.stringify(selectedProvider, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </>
    );
}
