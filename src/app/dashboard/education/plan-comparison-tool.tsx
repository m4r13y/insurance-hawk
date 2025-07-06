
"use client"

import { useState } from 'react';
import { mockPlans } from '@/lib/mock-data';
import type { Plan } from '@/types';
import { PlanCard } from '@/components/plan-card';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle } from 'lucide-react';

export function PlanComparisonTool() {
  const [selectedPlans, setSelectedPlans] = useState<(Plan | null)[]>([mockPlans[0], mockPlans[1], null]);

  const handlePlanSelect = (planId: string, index: number) => {
    const newSelectedPlans = [...selectedPlans];
    if (planId === 'none') {
        newSelectedPlans[index] = null;
    } else {
        newSelectedPlans[index] = mockPlans.find(p => p.id === planId) || null;
    }
    setSelectedPlans(newSelectedPlans);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedPlans.map((plan, index) => (
            <div key={index}>
                <Select onValueChange={(planId) => handlePlanSelect(planId, index)} defaultValue={plan?.id ?? "none"}>
                    <SelectTrigger className="w-full mb-4">
                        <SelectValue placeholder="Select a plan to compare" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {mockPlans.map(p => (
                            <SelectItem key={p.id} value={p.id} disabled={selectedPlans.some(sp => sp?.id === p.id && sp?.id !== plan?.id)}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {plan ? (
                    <PlanCard plan={plan} showSelectButton={false} />
                ) : (
                     <Card className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed bg-muted/50">
                        <CardContent className="flex flex-col items-center justify-center text-center p-6">
                            <PlusCircle className="h-10 w-10 text-muted-foreground" />
                            <p className="mt-4 text-sm font-medium text-muted-foreground">Select a plan to compare</p>
                        </CardContent>
                     </Card>
                )}
            </div>
        ))}
    </div>
  );
}
