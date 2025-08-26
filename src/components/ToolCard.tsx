"use client"

import React from "react";
import { motion } from "framer-motion";
import GlossyIcon from "./glossy-icon";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color?: "red" | "blue" | "green" | "slate" | "purple" | "orange";
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ 
  href, 
  icon, 
  title, 
  description, 
  color = "blue",
  className = "" 
}) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "group glass rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center backdrop-blur-md bg-card/80 dark:bg-card/10 border border-white/20 hover:border-white/30 glow-primary",
      className
    )}
  >
    <div className="mb-4 transform group-hover:scale-110 transition-transform duration-200">
      <GlossyIcon color={color} size="lg">
        {icon}
      </GlossyIcon>
    </div>
    <span className="font-semibold text-lg mb-2 text-foreground group-hover:text-primary transition-colors">
      {title}
    </span>
    <span className="text-sm text-muted-foreground leading-relaxed">
      {description}
    </span>
    
    {/* Hover gradient overlay */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </motion.a>
);
