
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
                    <p>This feature requires a Firebase backend. To enable it:</p>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                        <li>Create a Firebase project in the <Link href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firebase Console</Link>.</li>
                        <li>Add a Web App to your project and copy the configuration object.</li>
                        <li>Create a <strong>.env.local</strong> file in your project root and add the keys from <strong>.env.example</strong>.</li>
                        <li>Enable <strong>Email/Password sign-in</strong> in Firebase Authentication.</li>
                        <li>Create a <strong>Firestore database</strong>.</li>
                        <li><strong>Restart your development server</strong> for the changes to apply.</li>
                    </ol>
                </AlertDescription>
            </Alert>
        </div>
    );
}
