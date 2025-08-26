"use client";

import { useState, useMemo } from "react";
import { resourcesList } from "@/resources/resourcesList";
import { 
  HeroSection,
  FeaturedResourcesSection,
  SearchAndFilterSection,
  ResourcesGrid
} from "@/components/library";

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      {/* <FeaturedResourcesSection /> */}

      <div className="container mx-auto px-4 pb-12">
        <SearchAndFilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          types={types}
        />

        <ResourcesGrid resources={filteredResources} />
      </div>
    </div>
  );
}
