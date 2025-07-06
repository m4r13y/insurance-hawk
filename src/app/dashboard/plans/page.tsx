"use client"

import { useState } from 'react';
import { mockPlans } from '@/lib/mock-data';
import type { Plan } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, Ear, Pill, Star, Search, Filter } from 'lucide-react';
import Link from 'next/link';

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="secondary" className="mb-2">{plan.type}</Badge>
            <CardTitle className="font-headline text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.provider}</CardDescription>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span>{plan.rating.toFixed(1)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex justify-between items-baseline border-b pb-4">
          <p className="text-3xl font-bold">${plan.premium}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground">Deductible</p><p className="font-medium">${plan.deductible}</p></div>
            <div><p className="text-muted-foreground">Max Out-of-Pocket</p><p className="font-medium">${plan.maxOutOfPocket}</p></div>
        </div>
        <div>
            <h4 className="text-sm font-medium mb-2">Key Features</h4>
            <div className="flex flex-wrap gap-2">
                {plan.features.prescriptionDrug && <Badge variant="outline"><Pill className="mr-1.5 h-3 w-3"/>Drugs</Badge>}
                {plan.features.dental && <Badge variant="outline"><Heart className="mr-1.5 h-3 w-3"/>Dental</Badge>}
                {plan.features.vision && <Badge variant="outline"><Eye className="mr-1.5 h-3 w-3"/>Vision</Badge>}
                {plan.features.hearing && <Badge variant="outline"><Ear className="mr-1.5 h-3 w-3"/>Hearing</Badge>}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/apply">Select Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function PlansPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [planType, setPlanType] = useState('all');
    const [sortBy, setSortBy] = useState('rating');

    const filteredAndSortedPlans = mockPlans
        .filter(plan => {
            const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) || plan.provider.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = planType === 'all' || plan.type === planType;
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'premium_asc') return a.premium - b.premium;
            if (sortBy === 'premium_desc') return b.premium - a.premium;
            if (sortBy === 'rating') return b.rating - a.rating;
            return 0;
        });

  return (
    <div className="space-y-6">
       <div>
        <h1 className="font-headline text-3xl font-bold">Browse Plans</h1>
        <p className="text-muted-foreground">Compare and find the best plan for you.</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by plan or provider..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 md:flex gap-4">
                <Select value={planType} onValueChange={setPlanType}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Plan Types</SelectItem>
                        <SelectItem value="HMO">HMO</SelectItem>
                        <SelectItem value="PPO">PPO</SelectItem>
                        <SelectItem value="FFS">FFS</SelectItem>
                        <SelectItem value="SNP">SNP</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="rating">Sort by Rating</SelectItem>
                        <SelectItem value="premium_asc">Sort by Premium (Low to High)</SelectItem>
                        <SelectItem value="premium_desc">Sort by Premium (High to Low)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
      </Card>
      
      {filteredAndSortedPlans.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAndSortedPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      ) : (
        <div className="text-center py-16">
            <h3 className="font-headline text-2xl font-semibold">No Plans Found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}
