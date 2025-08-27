"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { resourcesList } from "@/resources/resourcesList";
import Link from "next/link";
import { 
  StarIcon, 
  VideoIcon, 
  FileTextIcon, 
  ReaderIcon, 
  GearIcon,
  FileIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowRightIcon
} from "@radix-ui/react-icons";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Get unique types for filters
  const types = useMemo(() => {
    const typeSet = Array.from(new Set(resourcesList.map(resource => resource.type).filter(Boolean)));
    return ["All", ...typeSet];
  }, []);

  // Filter resources based on search and filter criteria
  const filteredResources = useMemo(() => {
    return resourcesList.filter(resource => {
      const matchesSearch = !searchTerm || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "All" || resource.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  // Get featured resources
  const featuredResources = useMemo(() => {
    return resourcesList.filter(resource => resource.featured).slice(0, 6);
  }, []);

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <VideoIcon className="w-4 h-4" />;
      case 'article':
        return <FileTextIcon className="w-4 h-4" />;
      case 'guide':
        return <ReaderIcon className="w-4 h-4" />;
      case 'tool':
        return <GearIcon className="w-4 h-4" />;
      default:
        return <FileIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-muted mt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-4">
              Resource Library
            </h1>
            <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto mb-8">
              Comprehensive guides, articles, and tools to help you navigate insurance decisions with confidence.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Resources Section */}
        {featuredResources.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Featured Resources</h2>
                <p className="text-muted-foreground mt-2">Top picks to get you started</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className="border">
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
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
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
        )}

        {/* Search and Filter Section */}
        <div className="bg-card rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <Badge variant="outline" className="border">
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
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
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
    </div>
  );
}

