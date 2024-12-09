import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // Using a CTE (Common Table Expression) to first calculate totals per household
    const demographicsQuery = `
      WITH TransactionTotals AS (
        SELECT 
          h.Hshd_num,
          h.Income_range,
          h.Hshd_size,
          CASE WHEN h.Children > 0 THEN 'With Children' ELSE 'No Children' END as Child_Status,
          SUM(t.Spend) as Total_Spend,
          COUNT(t.Basket_num) as Transaction_Count
        FROM Households h
        JOIN Transactions t ON h.Hshd_num = t.Hshd_num
        GROUP BY 
          h.Hshd_num,
          h.Income_range,
          h.Hshd_size,
          CASE WHEN h.Children > 0 THEN 'With Children' ELSE 'No Children' END
      )
      SELECT 
        Income_range,
        Hshd_size,
        Child_Status,
        COUNT(DISTINCT Hshd_num) as Household_Count,
        CAST(AVG(CAST(Total_Spend as FLOAT) / NULLIF(Transaction_Count, 0)) as DECIMAL(10,2)) as Avg_Spend_Per_Transaction,
        SUM(Total_Spend) as Total_Spend,
        SUM(Transaction_Count) as Total_Transactions
      FROM TransactionTotals
      GROUP BY 
        Income_range,
        Hshd_size,
        Child_Status
      ORDER BY 
        CASE Income_range
          WHEN 'UNDER 35K' THEN 1
          WHEN '35-49K' THEN 2
          WHEN '50-74K' THEN 3
          WHEN '75-99K' THEN 4
          WHEN '100-150K' THEN 5
          WHEN '150K+' THEN 6
        END,
        Hshd_size;
    `;

    // Execute query and handle response
    const demographics = await executeQuery(demographicsQuery);

    return NextResponse.json({
      demographics,
    });
  } catch (error) {
    console.error('Analytics query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}