
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { testGetCounty } from './actions';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';

export default function ApiTestPage() {
    const [zipCode, setZipCode] = useState("76116");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        setError(null);

        const response = await testGetCounty(zipCode);

        if (response.error) {
            setError(response.error);
        } else {
            setResult(response.data);
        }

        setIsLoading(false);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>API GET Request Test</CardTitle>
                    <CardDescription>
                        This page isolates the county lookup GET request to the Healthcare.gov API to debug connection issues.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input
                                id="zip"
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="Enter a 5-digit ZIP code"
                                maxLength={5}
                            />
                        </div>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Test API Call
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {error && (
                 <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>API Error</AlertTitle>
                    <AlertDescription>
                        <pre className="text-xs whitespace-pre-wrap break-words">{error}</pre>
                    </AlertDescription>
                </Alert>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>API Response</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="p-4 bg-muted rounded-md overflow-x-auto text-sm">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
