'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

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



export default function HouseholdDashboard() {
    const id = useParams().id
    const router = useRouter()
    const [data, setData] = useState<HouseholdTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    useEffect(() => {
        async function fetchData() {
          try {
            const response = await fetch(`/api/household/${id}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            const householdData = await response.json();
            
            // Additional sort on the frontend to guarantee order
            householdData.sort((a: HouseholdTransaction, b: HouseholdTransaction) => {
              // Compare Hshd_num
              if (a.Hshd_num !== b.Hshd_num) return a.Hshd_num - b.Hshd_num;
              
              // Compare Basket_num
              if (a.Basket_num !== b.Basket_num) return a.Basket_num - b.Basket_num;
              
              // Compare Date
              const dateA = new Date(a.Date);
              const dateB = new Date(b.Date);
              if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
              
              // Compare Product_num
              if (a.Product_num !== b.Product_num) return a.Product_num.localeCompare(b.Product_num);
              
              // Compare Department
              if (a.Department !== b.Department) return a.Department.localeCompare(b.Department);
              
              // Compare Commodity
              return a.Commodity.localeCompare(b.Commodity);
            });
    
            setData(householdData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
          } finally {
            setLoading(false);
          }
        }
    
        fetchData();
      }, [id]);

    if (loading) return <div className="flex justify-center p-8">Loading...</div>;
    if (error) return <div className="flex justify-center p-8 text-red-500">Error: {error}</div>;
    if (!data.length) return <div className="flex justify-center p-8">No data found for this household</div>;

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    // Render our dashboard
    return (
        <div className="container mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        Data Pull for Household #{id}
                    </CardTitle>
                    <p className="text-center text-gray-600">
                        Linking the <span className="text-purple-600">household</span>, 
                        <span className="text-teal-500"> transaction</span>, and 
                        <span className="text-yellow-500"> products</span> tables
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-purple-600">Hshd_num</TableHead>
                                    <TableHead className="text-teal-500">Basket_num</TableHead>
                                    <TableHead className="text-teal-500">Date</TableHead>
                                    <TableHead className="text-yellow-500">Product_num</TableHead>
                                    <TableHead className="text-yellow-500">Department</TableHead>
                                    <TableHead className="text-yellow-500">Commodity</TableHead>
                                    <TableHead className="text-teal-500">Spend</TableHead>
                                    <TableHead className="text-teal-500">Units</TableHead>
                                    <TableHead className="text-teal-500">Store_region</TableHead>
                                    <TableHead className="text-teal-500">Week_num</TableHead>
                                    <TableHead className="text-teal-500">Year</TableHead>
                                    <TableHead className="text-purple-600">Loyalty_flag</TableHead>
                                    <TableHead className="text-purple-600">Age_range</TableHead>
                                    <TableHead className="text-purple-600">Marital_status</TableHead>
                                    <TableHead className="text-purple-600">Income_range</TableHead>
                                    <TableHead className="text-purple-600">Homeowner_desc</TableHead>
                                    <TableHead className="text-purple-600">Hshd_composition</TableHead>
                                    <TableHead className="text-purple-600">Hshd_size</TableHead>
                                    <TableHead className="text-purple-600">Children</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.Hshd_num}</TableCell>
                                        <TableCell>{row.Basket_num}</TableCell>
                                        <TableCell>{new Date(row.Date).toLocaleDateString()}</TableCell>
                                        <TableCell>{row.Product_num}</TableCell>
                                        <TableCell>{row.Department}</TableCell>
                                        <TableCell>{row.Commodity}</TableCell>
                                        <TableCell>${row.Spend.toFixed(2)}</TableCell>
                                        <TableCell>{row.Units}</TableCell>
                                        <TableCell>{row.Store_region}</TableCell>
                                        <TableCell>{row.Week_num}</TableCell>
                                        <TableCell>{row.Year}</TableCell>
                                        <TableCell>{row.Loyalty_flag}</TableCell>
                                        <TableCell>{row.Age_range}</TableCell>
                                        <TableCell>{row.Marital_status}</TableCell>
                                        <TableCell>{row.Income_range}</TableCell>
                                        <TableCell>{row.Homeowner_desc}</TableCell>
                                        <TableCell>{row.Hshd_composition}</TableCell>
                                        <TableCell>{row.Hshd_size}</TableCell>
                                        <TableCell>{row.Children}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between mt-4 px-4">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} entries
                        </div>
                    </div>
                </CardContent>
            </Card>
                    <Button
                        variant={'link'}
                        onClick={() => router.push("/dashboard")}
                    >
                        Return
                    </Button>
        </div>
    );
}