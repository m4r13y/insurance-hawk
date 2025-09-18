import CardsSandboxPage, { CardsSandboxProps } from '../page';
import { redirect } from 'next/navigation';

// Dynamic category route wrapper. We reuse the sandbox page component but allow
// the category to be driven by the URL segment. The sandbox component will read
// the segment via a prop we inject here, enabling deep links like
// /shop-components/medigap or /shop-components/dental.

interface Params { category: string }

// In Next.js 15 dynamic route params are provided as a promise and must be awaited
export default async function CategorySandboxRoute({ params }: { params: Promise<Params> }) {
  const { category } = await params;
  const allowed = ['medigap','advantage','cancer','hospital','final-expense','drug-plan','dental'];
  if (!allowed.includes(category)) {
    redirect('/shop-components/medigap');
  }
  return <CardsSandboxPage initialCategory={category} />;
}
