import React from "react";
import { notFound } from 'next/navigation';
import { resourcesList } from "@/resources/resourcesList";
import { Metadata } from 'next';

// Import all possible article components
import { AvoidingPenaltiesContent } from "@/components/blog-articles/AvoidingPenaltiesContent";
import { WorkingPast65Content } from "@/components/blog-articles/WorkingPast65Content";

interface BlogArticlePageProps {
  params: {
    slug: string;
  };
}

// Generate static pages for each resource with a slug
export async function generateStaticParams() {
  return resourcesList
    .filter(resource => resource.slug)
    .map((resource) => ({
      slug: resource.slug,
    }));
}

// Dynamically generate metadata for each page
export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const resource = resourcesList.find(r => r.slug === params.slug);
  if (!resource) {
    return {
      title: "Resource Not Found",
      description: "The requested resource could not be found."
    }
  }
  return {
    title: resource.title,
    description: resource.description,
    keywords: resource.tags,
  };
}

// A map to connect slugs to their React components
const articleComponents: Record<string, React.ComponentType> = {
  'avoiding-penalties': AvoidingPenaltiesContent,
  'working-past-65': WorkingPast65Content,
  // Add other slug-to-component mappings here as you create them
};

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = params;
  const ArticleComponent = articleComponents[slug];

  // If no component is found for the slug, show a 404 page
  if (!ArticleComponent) {
    notFound();
  }
  
  return (
    <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
      <ArticleComponent />
    </div>
  );
}
