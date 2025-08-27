'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClockIcon, 
  ArrowRightIcon,
  ReaderIcon,
  GearIcon,
  FileTextIcon
} from '@radix-ui/react-icons';
import { libraryData } from './libraryData';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Guide':
      return <ReaderIcon className="w-3 h-3" />;
    case 'Calculator':
      return <GearIcon className="w-3 h-3" />;
    case 'Reference':
      return <FileTextIcon className="w-3 h-3" />;
    default:
      return <FileTextIcon className="w-3 h-3" />;
  }
};

export function FeaturedResourcesSection() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground dark:text-primary-foreground mb-2">Featured Resources</h2>
        <p className="text-muted-foreground">Start with these popular guides and tools</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {libraryData.featuredResources.map((resource, index) => (
          <Card key={index} className="group hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 border-2 border-blue-100 dark:border-blue-800 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="border border-primary/20 dark:border-primary bg-primary/10 dark:bg-primary/20">
                  <div className="flex items-center space-x-1">
                    {getTypeIcon(resource.type)}
                    <span className="text-xs font-medium">{resource.type}</span>
                  </div>
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {resource.duration} {resource.durationUnit}
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors text-card-foreground">
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
              <Link 
                href={resource.slug ? `/resources/${resource.slug}` : resource.url || '#'} 
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm group"
              >
                {resource.linkLabel || 'Learn More'}
                <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
