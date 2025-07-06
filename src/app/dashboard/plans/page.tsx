
"use client"

import { useState } from 'react';
import { mockPlans } from '@/lib/mock-data';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { PlanCard } from '@/components/plan-card';


export default function PlansPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [planCategory, setPlanCategory] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    const filteredAndSortedPlans = mockPlans
        .filter(plan => {
            const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) || plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = planCategory === 'all' || plan.category === planCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'premium_asc') return a.premium - b.premium;
            if (sortBy === 'premium_desc') return b.premium - a.premium;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

    const featuredPlanId = sortBy === 'rating' && filteredAndSortedPlans.length > 0 ? filteredAndSortedPlans[0].id : null;

  return (
    <div className="space-y-8 md:space-y-12">
       <div className="max-w-4xl">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">Browse Plans</h1>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">Compare and find the best plan for you.</p>
      </div>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by plan or provider..." className="pl-12 h-12 text-base" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-4">
                <Select value={planCategory} onValueChange={setPlanCategory}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 text-base">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Plan Types</SelectItem>
                        <SelectItem value="Medicare Supplement">Medicare Supplement</SelectItem>
                        <SelectItem value="Health Insurance">Health Insurance</SelectItem>
                        <SelectItem value="Dental">Dental</SelectItem>
                        <SelectItem value="Cancer">Cancer</SelectItem>
                        <SelectItem value="Hospital Indemnity">Hospital Indemnity</SelectItem>
                        <SelectItem value="Long Term Care">Long Term Care</SelectItem>
                        <SelectItem value="Life Insurance">Life Insurance</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px] h-12 text-base">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating">Sort by Rating</SelectItem>
                        <SelectItem value="premium_asc">Sort by Premium (Low to High)</SelectItem>
                        <SelectItem value="premium_desc">Sort by Premium (High to Low)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </Card>
      
      {filteredAndSortedPlans.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
            {filteredAndSortedPlans.map(plan => <PlanCard key={plan.id} plan={plan} isFeatured={plan.id === featuredPlanId} />)}
        </div>
      ) : (
        <div className="text-center py-20">
            <h3 className="text-2xl font-semibold">No Plans Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
