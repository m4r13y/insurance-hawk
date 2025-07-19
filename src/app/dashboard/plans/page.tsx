
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
    <div className="bg-gray-50 dark:bg-neutral-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Search and Filter Section */}
        <Card className="shadow-lg border-0 bg-white dark:bg-neutral-800">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                  placeholder="Search by plan or provider..." 
                  className="pl-12 h-12 text-base border-gray-200 dark:border-neutral-700 focus:border-indigo-500 dark:focus:border-indigo-400" 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-4">
                <Select value={planCategory} onValueChange={setPlanCategory}>
                  <SelectTrigger className="w-full lg:w-[200px] h-12 text-base border-gray-200 dark:border-neutral-700">
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
                  <SelectTrigger className="w-full lg:w-[180px] h-12 text-base border-gray-200 dark:border-neutral-700">
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
          </div>
        </Card>
        
        {/* Results Section */}
        {filteredAndSortedPlans.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600 dark:text-neutral-400">
                Showing {filteredAndSortedPlans.length} plans
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
              {filteredAndSortedPlans.map(plan => (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  isFeatured={plan.id === featuredPlanId} 
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="shadow-lg border-0 bg-white dark:bg-neutral-800">
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">No Plans Found</h3>
              <p className="text-gray-600 dark:text-neutral-400 mt-2">Try adjusting your search or filters to find plans that match your criteria.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
