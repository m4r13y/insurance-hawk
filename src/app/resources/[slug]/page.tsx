
import React from "react";
import { notFound } from 'next/navigation';
import { resourcesList } from "@/resources/resourcesList";
import type { Metadata } from 'next';

// Import all possible article components
import { AvoidingPenaltiesContent } from "@/components/blog-articles/AvoidingPenaltiesContent";
import { WorkingPast65Content } from "@/components/blog-articles/WorkingPast65Content";
import { AnnualChangesContent } from "@/components/blog-articles/AnnualChangesContent";
import { BenefitsOfHipPlansContent } from "@/components/blog-articles/BenefitsOfHipPlansContent";
import { CancerPlanClaimProcessContent } from "@/components/blog-articles/CancerPlanClaimProcessContent";
import { CancerPlansWithMedigapContent } from "@/components/blog-articles/CancerPlansWithMedigapContent";
import { CancerStatisticsContent } from "@/components/blog-articles/CancerStatisticsContent";
import { CompareAdvantagePlansContent } from "@/components/blog-articles/CompareAdvantagePlansContent";
import { ComparePdpPlansContent } from "@/components/blog-articles/ComparePdpPlansContent";
import { CompareOptionsContent } from "@/components/blog-articles/CompareOptionsContent";
import { DesigningCancerPlansContent } from "@/components/blog-articles/DesigningCancerPlansContent";
import { DesigningHipPlansContent } from "@/components/blog-articles/DesigningHipPlansContent";
import { DrugPlansExplainedContent } from "@/components/blog-articles/DrugPlansExplainedContent";
import { EnrollmentForSnpContent } from "@/components/blog-articles/EnrollmentForSnpContent";
import { EnrollmentPeriodsContent } from "@/components/blog-articles/EnrollmentPeriodsContent";
import { HipForAdvantageContent } from "@/components/blog-articles/HipForAdvantageContent";
import { HipForIndividualsContent } from "@/components/blog-articles/HipForIndividualsContent";
import { MedicareBeginnersGuideContent } from "@/components/blog-articles/MedicareBeginnersGuideContent";
import { MedicareMistakesContent } from "@/components/blog-articles/MedicareMistakesContent";
import { MedicareQuestionsContent } from "@/components/blog-articles/MedicareQuestionsContent";
import { MedigapRateIncreasesContent } from "@/components/blog-articles/MedigapRateIncreasesContent";
import { PdpProsConsContent } from "@/components/blog-articles/PdpProsConsContent";
import { ReimbursementVsDiagnosisContent } from "@/components/blog-articles/ReimbursementVsDiagnosisContent";
import { TopPlanFAddonsContent } from "@/components/blog-articles/TopPlanFAddonsContent";
import { TopPlanGAddonsContent } from "@/components/blog-articles/TopPlanGAddonsContent";
import { TopPlanNAddonsContent } from "@/components/blog-articles/TopPlanNAddonsContent";
import { CancerPlansWithAdvantageContent } from "@/components/blog-articles/CancerPlansWithAdvantageContent";


interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
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
  const { slug } = await params;
  const resource = resourcesList.find(r => r.slug === slug);
  if (!resource) {
    return {
      title: "Resource Not Found",
      description: "The requested resource could not be found."
    }
  }

  // Define the Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.theinsurancehawk.com/resources/${resource.slug}`, 
    },
    headline: resource.title,
    description: resource.description,
    author: {
      '@type': 'Person',
      name: 'Jonathan Hawkins', // Assuming a single author for now
    },
    publisher: {
      '@type': 'Organization',
      name: 'The Insurance Hawk',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.yourwebsite.com/logo.png', // Replace with your actual logo URL
      },
    },
    datePublished: new Date().toISOString(), // Placeholder, ideally this would come from your resource data
    dateModified: new Date().toISOString(), // Placeholder
  };
  
  return {
    title: resource.title,
    description: resource.description,
    keywords: resource.tags,
    // Add the JSON-LD script to the page's head
    other: {
      'script:ld+json': JSON.stringify(jsonLd),
    }
  };
}

// A map to connect slugs to their React components (add more as needed)
const articleComponents: Record<string, React.ComponentType> = {
  'avoiding-penalties': AvoidingPenaltiesContent,
  'working-past-65': WorkingPast65Content,
  'annual-changes': AnnualChangesContent,
  'benefits-of-hip-plans': BenefitsOfHipPlansContent,
  'cancer-plan-claim-process': CancerPlanClaimProcessContent,
  'cancer-plans-with-medigap': CancerPlansWithMedigapContent,
  'cancer-statistics': CancerStatisticsContent,
  'compare-advantage-plans': CompareAdvantagePlansContent,
  'compare-pdp-plans': ComparePdpPlansContent,
  'compare-options': CompareOptionsContent,
  'designing-cancer-plans': DesigningCancerPlansContent,
  'designing-hip-plans': DesigningHipPlansContent,
  'drug-plans-explained': DrugPlansExplainedContent,
  'enrollment-for-snp': EnrollmentForSnpContent,
  'enrollment-periods': EnrollmentPeriodsContent,
  'hip-for-advantage': HipForAdvantageContent,
  'hip-for-individuals': HipForIndividualsContent,
  'medicare-beginners-guide': MedicareBeginnersGuideContent,
  'medicare-mistakes': MedicareMistakesContent,
  'medicare-questions': MedicareQuestionsContent,
  'medigap-rate-increases': MedigapRateIncreasesContent,
  'pdp-pros-cons': PdpProsConsContent,
  'reimbursement-vs-diagnosis': ReimbursementVsDiagnosisContent,
  'top-plan-f-addons': TopPlanFAddonsContent,
  'top-plan-g-addons': TopPlanGAddonsContent,
  'top-plan-n-addons': TopPlanNAddonsContent,
  'cancer-plans-with-advantage': CancerPlansWithAdvantageContent,
  // Add more as you add new article components
};

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const resource = resourcesList.find(r => r.slug === slug);
  const ArticleComponent = articleComponents[slug];

  if (ArticleComponent) {
    return (
      <div className="max-w-[85rem] px-4 sm:px-6 lg:px-8 mx-auto">
        <ArticleComponent />
      </div>
    );
  }

  // Fallback UI for non-article resources
  if (resource) {
    if (resource.type === 'Video' && resource.url) {
      return (
        <div className="max-w-2xl mx-auto py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>
          <p className="mb-6 text-gray-600">{resource.description}</p>
          <div className="aspect-video mb-6">
            <iframe src={resource.url} title={resource.title} allowFullScreen className="w-full h-full rounded-lg border" />
          </div>
          <a href={resource.url} target="_blank" rel="noopener" className="text-blue-600 underline">Watch on YouTube</a>
        </div>
      );
    }
    // Fallback for guides or other types
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">{resource.title}</h1>
        <p className="mb-6 text-gray-600">{resource.description}</p>
        <p className="italic text-gray-400">No detailed article is available for this resource.</p>
      </div>
    );
  }

  // If no resource or component found, show 404
  notFound();
}
