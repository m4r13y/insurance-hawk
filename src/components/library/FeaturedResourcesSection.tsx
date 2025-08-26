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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Featured Resources</h2>
        <p className="text-gray-600 dark:text-gray-300">Start with these popular guides and tools</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {libraryData.featuredResources.map((resource, index) => (
          <Card key={index} className="group hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 border-2 border-blue-100 dark:border-blue-800 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-1">
                    {getTypeIcon(resource.type)}
                    <span className="text-xs font-medium">{resource.type}</span>
                  </div>
                </Badge>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {resource.duration} {resource.durationUnit}
                </div>
              </div>
              <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-gray-900 dark:text-white">
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{resource.description}</p>
              <Link 
                href={resource.slug ? `/resources/${resource.slug}` : resource.url || '#'} 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm group"
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
