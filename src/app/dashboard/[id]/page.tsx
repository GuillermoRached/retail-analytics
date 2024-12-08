// src/app/dashboard/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SpendingChart from '@/components/SpendingChart';

// Define our data structure to ensure type safety throughout the component
interface HouseholdTransaction {
    Hshd_num: number;
    Loyalty_flag: string;
    Age_range: string;
    Marital_status: string;
    Income_range: string;
    Homeowner_desc: string;
    Hshd_composition: string;
    Hshd_size: number;
    Children: number;
    Basket_num: number;
    Date: string;
    Product_num: string;
    Department: string;
    Commodity: string;
    Spend: number;
    Units: number;
    Store_region: string;
    Week_num: number;
    Year: number;
}

export default function HouseholdDashboard({ params }: { params: { id: string } }) {
    // State management for our component
    const [data, setData] = useState<HouseholdTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data when the component mounts or when the household ID changes
    useEffect(() => {
        async function fetchData() {
            const {id} = await params
            try {
                const response = await fetch(`/api/household/${id}`);
                if (!response.ok) throw new Error('Failed to fetch data');
                const householdData = await response.json();
                setData(householdData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Transform our transaction data into a format suitable for the chart
    const prepareChartData = () => {
        const spendingByDate = data.reduce((acc, transaction) => {
            const date = new Date(transaction.Date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + transaction.Spend;
            return acc;
        }, {} as { [key: string]: number });

        return Object.entries(spendingByDate).map(([date, spend]) => ({
            date,
            spend
        }));
    };

    // Handle loading and error states
    if (loading) return <div className="flex justify-center p-8">Loading...</div>;
    if (error) return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>;
    if (!data.length) return <div className="flex justify-center p-8">No data found for this household</div>;

    // Get the first record for household information display
    const householdInfo = data[0];

    // Render our dashboard
    return (
        <div className="container mx-auto p-4 space-y-6">
            {/* Household Summary Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Household #{params.id} Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <h3 className="font-semibold">Loyalty Status</h3>
                            <p>{householdInfo.Loyalty_flag}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Age Range</h3>
                            <p>{householdInfo.Age_range}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Income Range</h3>
                            <p>{householdInfo.Income_range}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold">Household Size</h3>
                            <p>{householdInfo.Hshd_size} (Children: {householdInfo.Children})</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Spending Trend Visualization */}
            <Card>
                <CardHeader>
                    <CardTitle>Spending Trend Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px]">
                        <SpendingChart data={prepareChartData()} />
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Basket #</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Commodity</TableHead>
                                <TableHead className="text-right">Spend</TableHead>
                                <TableHead className="text-right">Units</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((transaction, index) => (
                                <TableRow key={`${transaction.Basket_num}-${transaction.Product_num}-${index}`}>
                                    <TableCell>{new Date(transaction.Date).toLocaleDateString()}</TableCell>
                                    <TableCell>{transaction.Basket_num}</TableCell>
                                    <TableCell>{transaction.Department}</TableCell>
                                    <TableCell>{transaction.Commodity}</TableCell>
                                    <TableCell className="text-right">
                                        ${transaction.Spend.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right">{transaction.Units}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}