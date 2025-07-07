
"use client";

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { searchProviders } from '@/app/dashboard/health-quotes/actions';
import type { Provider } from '@/types';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function ApiTestPage() {
    const [query, setQuery] = useState('');
    const [zipCode, setZipCode] = useState('76116'); 
    const [debouncedQuery] = useDebounce(query, 500);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);

    // New state for selected providers and the UI
    const [selectedProviders, setSelectedProviders] = useState<Provider[]>([]);
    const [showInNetworkOnly, setShowInNetworkOnly] = useState(true);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);

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
        // Add provider to selected list if not already there
        if (!selectedProviders.some(p => p.npi === provider.npi)) {
            setSelectedProviders(prev => [...prev, provider]);
        }
        setQuery(''); // Clear input
        setIsListVisible(false);
    };

    const handleRemoveProvider = (npi: string) => {
        setSelectedProviders(prev => prev.filter(p => p.npi !== npi));
    };

    return (
        <div className="max-w-xl mx-auto py-24 space-y-4">
            <Command className="overflow-visible rounded-lg border shadow-md">
                <div className="relative">
                    <CommandInput
                        value={query}
                        onValueChange={(value) => {
                            setQuery(value);
                            setIsListVisible(value.length > 0);
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

            <Button 
                onClick={() => setIsDetailsVisible(!isDetailsVisible)} 
                variant="outline"
                className="w-full"
                disabled={selectedProviders.length === 0}
            >
                {isDetailsVisible ? 'Hide' : 'Show'} Selected Providers ({selectedProviders.length})
            </Button>
            
            {isDetailsVisible && selectedProviders.length > 0 && (
                <Card className="animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle>Selected Providers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2 rounded-md border p-2 max-h-60 overflow-y-auto">
                            {selectedProviders.map(provider => (
                                <div key={provider.npi} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium">{provider.name}</p>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveProvider(provider.npi)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                        <span className="sr-only">Remove {provider.name}</span>
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center space-x-2 pt-4">
                            <Switch 
                                id="in-network-toggle" 
                                checked={showInNetworkOnly} 
                                onCheckedChange={setShowInNetworkOnly}
                            />
                            <Label htmlFor="in-network-toggle">Only show plans where all selected providers are in-network</Label>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
