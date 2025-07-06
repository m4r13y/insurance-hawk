
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export function FirebaseNotConfigured() {
    return (
        <div className="container mx-auto max-w-3xl py-12">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Firebase Not Configured</AlertTitle>
                <AlertDescription>
                    <p>Your Firebase credentials have not been provided. Features requiring user accounts and data storage will not work.</p>
                    <p className="mt-2">To fix this, add your Firebase project's configuration to the <strong>.env</strong> file in your project. You can use <strong>.env.example</strong> as a template.</p>
                    <p className="mt-2">For more details, see the <Link href="https://firebase.google.com/docs/web/setup#get-config-object" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firebase documentation</Link>.</p>
                </AlertDescription>
            </Alert>
        </div>
    );
}
