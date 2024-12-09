import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { DashboardSummaryResult, DashboardSummary } from '@/types/dashboard';

export async function GET() {
  try {
    console.log('Fetching dashboard summary...');
    
    // First query: Get the summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT h.Hshd_num) as totalHouseholds,
        COUNT(t.Basket_num) as totalTransactions,
        CAST(AVG(CAST(t.Spend as DECIMAL(10,2))) as DECIMAL(10,2)) as averageSpend
      FROM Households h
      LEFT JOIN Transactions t ON h.Hshd_num = t.Hshd_num;
    `;

    // Second query: Get a sample of household numbers
    // We'll get the first 100 households as a representative sample
    const householdsQuery = `
      SELECT TOP 100 Hshd_num
      FROM Households
      ORDER BY Hshd_num
      FOR JSON PATH;
    `;

    // Execute both queries
    const summaryResults = await executeQuery<DashboardSummaryResult>(summaryQuery);
    const householdsResults = await executeQuery<{ JSON: string }>(householdsQuery);

    // Handle the case where we don't get results
    if (!summaryResults || summaryResults.length === 0) {
      console.log('No summary results returned from query');
      return NextResponse.json({
        totalHouseholds: 0,
        totalTransactions: 0,
        averageSpend: 0,
        householdNumbers: []
      } as DashboardSummary);
    }

    // Parse the JSON result for households
    const householdNumbers = householdsResults[0]?.JSON 
      ? JSON.parse(householdsResults[0].JSON).map((h: any) => h.Hshd_num)
      : [];

    // Combine the results
    const summary: DashboardSummary = {
      totalHouseholds: summaryResults[0].totalHouseholds || 0,
      totalTransactions: summaryResults[0].totalTransactions || 0,
      averageSpend: summaryResults[0].averageSpend || 0,
      householdNumbers: householdNumbers
    };

    console.log('Summary prepared successfully');
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard summary',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}