"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface GenericQuoteLoadingProps {
  title?: string;
  message?: string;
}

export default function GenericQuoteLoading({ 
  title = "Getting Your Quotes",
  message = "Please wait while we search for the best plans in your area..."
}: GenericQuoteLoadingProps) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            {/* Loading Spinner */}
            <div className="relative">
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <div className="absolute inset-0 rounded-full border-4 border-muted animate-pulse" />
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {message}
              </p>
            </div>
            
            {/* Progress dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
