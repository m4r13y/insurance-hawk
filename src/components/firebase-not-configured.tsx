
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from 'lucide-react';
import Link from 'next/link';

export function FirebaseNotConfigured() {
    return (
        <div className="container mx-auto max-w-3xl py-12">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Firebase Not Configured or Initialization Failed</AlertTitle>
                <AlertDescription>
                    <p>Your app could not connect to Firebase. Please check the following:</p>
                    <ol className="list-decimal list-inside space-y-2 mt-4">
                        <li>Ensure your Firebase project's web app configuration has been added to a <strong>.env</strong> file at the root of your project. Use <strong>.env.example</strong> as a template.</li>
                        <li>Verify that all keys in your <strong>.env</strong> file are correct and do not contain extra characters like quotation marks.</li>
                        <li>Make sure you have enabled <strong>Email/Password sign-in</strong> in the Firebase Authentication settings and have created a <strong>Firestore database</strong> in your project.</li>
                        <li>After creating or modifying the <strong>.env</strong> file, you must <strong>restart the development server</strong> for the changes to apply.</li>
                    </ol>
                    <p className="mt-4">For more details, see the <Link href="https://firebase.google.com/docs/web/setup#get-config-object" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Firebase documentation</Link>.</p>
                </AlertDescription>
            </Alert>
        </div>
    );
}
