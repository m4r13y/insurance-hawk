/**
 * Preferred Carriers Filter Component
 * 
 * Provides a filter option in the sidebar to show only preferred carriers
 */

import React from 'react';
import { Switch } from '@/components/ui/switch';

interface PreferredCarriersFilterProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  preferredCount?: number;
  totalCount?: number;
  category: 'medicare-supplement' | 'medicare-advantage' | 'dental' | 'final-expense' | 'hospital-indemnity';
}

export default function PreferredCarriersFilter({
  isEnabled,
  onToggle
}: PreferredCarriersFilterProps) {
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">Preferred Carriers</span>
      <Switch
        checked={isEnabled}
        onCheckedChange={onToggle}
        aria-label="Toggle preferred carriers filter"
      />
    </div>
  );
}
