
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ExternalLink,
  Search,
  Phone,
  Star,
  FileText,
  Globe,
  Heart,
  Shield,
  Calculator,
  BookOpen,
  Users,
  AlertCircle,
  Filter,
} from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resourcesList } from "@/resources/resourcesList";
import type { ResourceCard } from "@/resources/resourcesList";

const resources = resourcesList;

const categories = ["All", "Official", "Support", "Financial", "Education", "Health", "Tools", "Research"];
const types = ["All", "article", "website", "document", "phone", "tool", "video"];

export default function ResourcesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const filteredResources: ResourceCard[] = resources.filter((resource: ResourceCard) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    const matchesType = selectedType === "All" || resource.type === selectedType;
    const matchesFeatured = !showFeaturedOnly || resource.featured;

    return matchesSearch && matchesCategory && matchesType && matchesFeatured;
  });

  const featuredResources: ResourceCard[] = resources.filter((resource: ResourceCard) => resource.featured);

  const getIcon = (type: string) => {
    switch (type) {
      case 'website': return <Globe className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'tool': return <Calculator className="w-4 h-4" />;
      case 'video': return <BookOpen className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Official': return <Shield className="w-4 h-4" />;
      case 'Support': return <Users className="w-4 h-4" />;
      case 'Financial': return <Calculator className="w-4 h-4" />;
      case 'Education': return <BookOpen className="w-4 h-4" />;
      case 'Health': return <Heart className="w-4 h-4" />;
      case 'Tools': return <Calculator className="w-4 h-4" />;
      case 'Research': return <AlertCircle className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const handleResourceClick = (e: React.MouseEvent, resource: ResourceCard) => {
    if (resource.type === 'article' && resource.slug) {
      // Let the Next.js Link handle navigation
      return;
    }
    // For external links, prevent default and open in new tab
    e.preventDefault();
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.phone) {
      window.location.href = `tel:${resource.phone}`;
    }
  };
  
  const getResourceHref = (resource: ResourceCard) => {
    if (resource.type === 'article' && resource.slug) {
      return `/dashboard/resources/${resource.slug}`;
    }
    return resource.url || '#';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Medicare Resources
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Essential tools, guides, and official resources to help you navigate Medicare with confidence.
          </p>
        </div>

        {/* Featured Resources */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Featured Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <Link key={resource.id} href={getResourceHref(resource)} legacyBehavior passHref>
                <a onClick={(e) => handleResourceClick(e, resource)} target={resource.url ? '_blank' : undefined} rel={resource.url ? 'noopener noreferrer' : undefined} className="block h-full">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon(resource.type)}
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                        </div>
                        {resource.official && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Official
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-sm">{resource.description}</CardDescription>
                      
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(resource.category)}
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{resource.category.replace("'", "&apos;")}</span>
                        {resource.rating && (
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{resource.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          className="w-full"
                          variant={resource.official ? "default" : "outline"}
                          asChild
                        >
                          <span>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Resource
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Search and Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Find Resources
            </CardTitle>
            <CardDescription>
              Search and filter through our comprehensive collection of Medicare resources.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search resources, topics, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                >
                  {types.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFeaturedOnly}
                  onChange={(e) => setShowFeaturedOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured only</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* All Resources */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              All Resources ({filteredResources.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredResources.map((resource) => (
              <Link key={resource.id} href={getResourceHref(resource)} legacyBehavior passHref>
                <a onClick={(e) => handleResourceClick(e, resource)} target={resource.url ? '_blank' : undefined} rel={resource.url ? 'noopener noreferrer' : undefined} className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getIcon(resource.type)}
                          <h3 className="font-semibold text-lg">{resource.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {resource.featured && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                          {resource.official && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                              Official
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{resource.description}</p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(resource.category)}
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{resource.category}</span>
                        </div>
                        {resource.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{resource.rating}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          variant={resource.official ? "default" : "outline"}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
          
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resources found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
        
        {/* Help Section */}
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">Need Personal Help?</h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  If you need personalized assistance with Medicare, consider reaching out to your local SHIP (State Health Insurance Assistance Program) counselor for free, unbiased help.
                </p>
                <Button asChild variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900">
                  <a href="https://www.shiphelp.org" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Find Local SHIP
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
