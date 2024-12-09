'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DemographicsChart } from '@/components/DemographicsChart';
import { SeasonalTrendsChart } from '@/components/SeasonalTrendsChart';
import { processSeasonalData, RawSeasonalData, SeasonalAnalysis } from '@/types/seasonal';

interface AnalyticsData {
    demographics: Array<{
        Income_range: string;
        Hshd_size: number;
        Child_Status: string;
        Total_Transactions: number;
        Avg_Spend: number;
        Household_Count: number;
        Avg_Spend_Per_Transaction: number;
        Total_Spend: number;
    }>;
    seasonalData: RawSeasonalData[];
}

export default function Dashboard() {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [processedSeasonalData, setProcessedSeasonalData] = useState<SeasonalAnalysis | null>(null);

    // Fetch summary data when the component mounts
    useEffect(() => {
        async function fetchAnalytics() {
            try {
                setLoading(true);
                const [demographicsResponse, seasonalResponse] = await Promise.all([
                    fetch('/api/analytics'),
                    fetch('/api/analytics/seasonal')
                ]);
                if (!demographicsResponse.ok || !seasonalResponse.ok) {
                    throw new Error('Failed to fetch analytics data');
                }

                const demographicsData = await demographicsResponse.json();
                const seasonalData = await seasonalResponse.json();

                // Combine the data
                const combinedData = {
                    demographics: demographicsData.demographics,
                    seasonalData: seasonalData.seasonalData
                };

                setData(combinedData);
                // Process seasonal data
                if (seasonalData.seasonalData) {
                    const processed = processSeasonalData(seasonalData.seasonalData);
                    setProcessedSeasonalData(processed);
                }
                setLoading(false);
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


    if (loading) return <LoadingState message="Loading analytics data..." />;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!data) return <div className="p-4">No data available</div>;

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
                    {data.demographics && <DemographicsChart data={data.demographics} />}
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
                    <CardTitle>Seasonal Shopping Patterns</CardTitle>
                    <CardDescription>
                        Understanding how spending and department performance varies throughout the year
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {data.seasonalData && <SeasonalTrendsChart data={data.seasonalData} />}
                    <div className="mt-4 text-sm text-gray-600">
                        <h4 className="font-semibold">Key Seasonal Insights:</h4>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Monthly spending patterns reveal peak shopping periods</li>
                            <li>Department performance shows distinct seasonal variations</li>
                            <li>Data suggests optimal timing for seasonal promotions</li>
                        </ul>
                    </div>
                    {processedSeasonalData && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(processedSeasonalData.seasonalSummary).map(([season, metrics]) => (
                                <div key={season} className="bg-gray-50 p-4 rounded-lg">
                                    <h5 className="font-semibold text-lg">{season}</h5>
                                    <p className="text-sm text-gray-600">
                                        Avg. Spend: ${metrics.averageSpend.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Transactions: {metrics.transactionCount.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}