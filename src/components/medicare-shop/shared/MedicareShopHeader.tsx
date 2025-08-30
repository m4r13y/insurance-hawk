"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";

interface MedicareShopHeaderProps {
  cartCount: number;
}

export default function MedicareShopHeader({ cartCount }: MedicareShopHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Cart Summary */}
        <div className="flex items-center gap-4">
          {cartCount > 0 && (
            <Badge variant="outline" className="px-3 py-1">
              {cartCount} plan{cartCount !== 1 ? 's' : ''} selected
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
