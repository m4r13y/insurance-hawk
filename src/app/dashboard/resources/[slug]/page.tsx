import React from "react";
import { notFound } from 'next/navigation';
import { resourcesList } from "@/resources/resourcesList";
import { Metadata } from 'next';

// Import all possible article components
import { AvoidingPenaltiesContent } from "@/components/blog-articles/AvoidingPenaltiesContent";
import { WorkingPast65Content } from "@/components/blog-articles/WorkingPast65Content";
import { AnnualChangesContent } from "@/components/blog-articles/AnnualChangesContent";
import { BenefitsOfHipPlansContent } from "@/components/blog-articles/BenefitsOfHipPlansContent";
import { CancerPlanClaimProcessContent } from "@/components/blog-articles/CancerPlanClaimProcessContent";
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
  'annual-changes': AnnualChangesContent,
  'benefits-of-hip-plans': BenefitsOfHipPlansContent,
  'cancer-plan-claim-process': CancerPlanClaimProcessContent,
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
