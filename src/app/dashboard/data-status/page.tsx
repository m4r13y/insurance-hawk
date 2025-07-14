'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Database, Users, Info } from "lucide-react"

export default function DataStatusPage() {
  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Data Architecture Status</h1>
        <p className="text-muted-foreground">
          Current data organization and collection structure information.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Production Ready
          </CardTitle>
          <CardDescription>
            All user data is now properly organized in the users collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-500">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold">System Status: Active</div>
              <div>All new user applications, medications, and doctor information are being saved to the "users" collection with proper subcollection structure.</div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Structure
          </CardTitle>
          <CardDescription>
            Current collection organization and data flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold">users/</div>
                <div className="text-sm text-muted-foreground">Main user profiles and application data</div>
              </div>
            </div>
            
            <div className="ml-6 space-y-2">
              <div className="flex items-center gap-3 p-3 border-l-2 border-blue-200 pl-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-medium">medications/</div>
                  <div className="text-sm text-muted-foreground">User medication subcollection</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 border-l-2 border-blue-200 pl-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-medium">doctors/</div>
                  <div className="text-sm text-muted-foreground">User healthcare providers subcollection</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <div className="font-semibold">Data Collection Information:</div>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>All insurance applications save user data to the "users" collection</li>
            <li>Medications and doctors are stored as subcollections for better organization</li>
            <li>Each user document uses their Firebase Auth UID as the document ID</li>
            <li>Data structure is optimized for scalability and performance</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
