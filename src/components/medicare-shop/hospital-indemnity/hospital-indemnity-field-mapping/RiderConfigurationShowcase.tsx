import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaCheckCircle, FaCog, FaLayerGroup, FaChartLine } from 'react-icons/fa';

export function RiderConfigurationShowcase() {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <FaCheckCircle className="h-5 w-5" />
          Enhanced Rider Configuration - Now Available!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FaCog className="h-4 w-4 text-blue-600" />
              Configurable Rider Options
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Ambulance Services</Badge>
                <span className="text-gray-600">$250 per occurrence</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Dental, Vision & Hearing</Badge>
                <span className="text-gray-600">$400, $800, or $1200 annually</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Outpatient Surgery</Badge>
                <span className="text-gray-600">$250, $500, or $1000 per surgery</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Skilled Nursing Care</Badge>
                <span className="text-gray-600">$100-$250 per day</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <FaLayerGroup className="h-4 w-4 text-purple-600" />
              Smart Features
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Multiple benefit amounts per rider</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Real-time premium calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                <span>Configuration validation & warnings</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                <span>Detailed plan summaries</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-3 border">
          <h5 className="font-medium mb-2 flex items-center gap-2">
            <FaChartLine className="h-4 w-4 text-green-600" />
            Example Configuration
          </h5>
          <div className="text-sm text-gray-700">
            <div><strong>Base Plan:</strong> 14 Benefit Days @ $200/day = $2,800 max per stay</div>
            <div><strong>Ambulance Rider:</strong> $250 per occurrence (+$1.48/month)</div>
            <div><strong>Surgery Rider:</strong> $500 per surgery (+$9.23/month)</div>
            <div><strong>Dental Rider:</strong> $800 annually (+$26.50/month)</div>
            <div className="mt-1 pt-1 border-t font-medium text-green-700">
              Total Premium: $93.21/month
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}