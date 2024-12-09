// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { DashboardSummary } from '@/types/dashboard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DemographicsChart } from '@/components/DemographicsChart';

interface AnalyticsData {
    demographics: any[];
    brands: any[];
    timeData: any[];
}

export default function Dashboard() {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);

    // Fetch summary data when the component mounts
    useEffect(() => {
        async function fetchAnalytics() {
            try {
                const response = await fetch('/api/analytics');
                if (!response.ok) throw new Error('Failed to fetch analytics data');
                const analyticsData = await response.json();
                setData(analyticsData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load analytics');
            } finally {
                setLoading(false);
            }
        }

        fetchAnalytics();
    }, []);

    // Handle search submission
    const handleSearch = async () => {
        const householdNumber = parseInt(searchInput);
        if (!isNaN(householdNumber)) {
            setSearchLoading(true);
            try {
                // We add a slight delay to prevent flickering for very fast loads
                await new Promise(resolve => setTimeout(resolve, 300));
                router.push(`/dashboard/${householdNumber}`);
            } finally {
                setSearchLoading(false);
            }
        }
    };

    if (loading) {
        return <LoadingState message="Loading dashboard data..." fullScreen />;
    }

    if (error) {
        return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>;
    }


    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Search Section with loading state */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex justify-center'>Search Household Data</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center gap-4">
                        <Input
                            type="text"
                            placeholder="Enter Household Number..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            disabled={searchLoading}
                            className="max-w-sm"
                        />
                        <Button
                            onClick={handleSearch}
                            disabled={searchLoading}
                        >
                            {searchLoading ? (
                                <>
                                    <LoadingSpinner />
                                    <span className="ml-2">Searching...</span>
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            {/* Demographics and Engagement Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Demographics Impact on Engagement</CardTitle>
                    <CardDescription>
                        Analyzing how household characteristics affect spending patterns
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data && <DemographicsChart data={data.demographics} />}
                    <div className="mt-4 text-sm text-gray-600">
                        <h4 className="font-semibold">Key Insights:</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>
                                Higher income households tend to have higher average transaction values
                            </li>
                            <li>
                                Household size shows a positive correlation with spending across all income ranges
                            </li>
                            <li>
                                Presence of children significantly impacts shopping patterns and average spend
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Seasonal Trends Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Seasonal Spending Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        {/* Seasonal trends chart will be rendered here */}
                    </div>
                </CardContent>
            </Card>

            {/* Brand Preferences Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Brand Preferences Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        {/* Brand preferences chart will be rendered here */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}