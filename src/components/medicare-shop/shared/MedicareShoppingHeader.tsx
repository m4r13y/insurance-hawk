"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Edit3, HelpCircle } from "lucide-react";
import { QuoteFormData } from "./types";

interface MedicareShoppingHeaderProps {
  title: string;
  quoteFormData: QuoteFormData;
  quotesCount: number;
  onStartOver: () => void;
  onEditInfo?: () => void;
  children?: React.ReactNode; // For any additional content
}

export default function MedicareShoppingHeader({
  title,
  quoteFormData,
  quotesCount,
  onStartOver,
  onEditInfo,
  children
}: MedicareShoppingHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-600">
            Showing {quotesCount} personalized plan{quotesCount !== 1 ? 's' : ''} for your area
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onEditInfo && (
            <Button variant="outline" onClick={onEditInfo}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Info
            </Button>
          )}
          <Button variant="outline" onClick={onStartOver}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
          <Button variant="outline">
            <HelpCircle className="w-4 h-4 mr-2" />
            Get Help
          </Button>
        </div>
      </div>

      {/* Quote Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Age:</span>
                <Badge variant="secondary">{quoteFormData.age}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">ZIP:</span>
                <Badge variant="secondary">{quoteFormData.zipCode}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Gender:</span>
                <Badge variant="secondary">
                  {quoteFormData.gender === 'male' ? 'Male' : 'Female'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Tobacco:</span>
                <Badge variant={quoteFormData.tobaccoUse ? "destructive" : "secondary"}>
                  {quoteFormData.tobaccoUse ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            
            {children && (
              <div className="flex-shrink-0">
                {children}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
