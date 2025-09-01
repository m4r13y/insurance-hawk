'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ClockIcon, 
  ArrowRightIcon,
  VideoIcon,
  FileTextIcon,
  ReaderIcon,
  GearIcon,
  FileIcon
} from '@radix-ui/react-icons';

interface Resource {
  title: string;
  description: string;
  type: string;
  duration: string;
  durationUnit: string;
  linkLabel?: string;
  slug?: string;
  url?: string;
}

interface ResourcesGridProps {
  resources: Resource[];
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Video':
      return <VideoIcon className="w-3 h-3" />;
    case 'Guide':
      return <ReaderIcon className="w-3 h-3" />;
    case 'Tool':
      return <GearIcon className="w-3 h-3" />;
    case 'Article':
      return <FileTextIcon className="w-3 h-3" />;
    case 'Calculator':
      return <GearIcon className="w-3 h-3" />;
    case 'Reference':
      return <FileTextIcon className="w-3 h-3" />;
    default:
      return <FileIcon className="w-3 h-3" />;
  }
};

export function ResourcesGrid({ resources }: ResourcesGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource, index) => (
        <Card key={index} className="group hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 !bg-card border !border-border">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <Badge variant="outline" className="border border-border">
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
  );
}
