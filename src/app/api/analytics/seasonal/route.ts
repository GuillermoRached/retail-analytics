import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    const seasonalQuery = `
      WITH MonthlyStats AS (
        SELECT 
          DATEPART(month, t.Purchase_Date) as Month,
          p.Department,
          SUM(t.Spend) as Total_Spend,
          COUNT(DISTINCT t.Basket_num) as Basket_Count,
          COUNT(*) as Transaction_Count,
          AVG(t.Spend) as Avg_Spend
        FROM Transactions t
        JOIN Products p ON t.Product_num = p.Product_num
        GROUP BY 
          DATEPART(month, t.Purchase_Date),
          p.Department
      )
      SELECT 
        Month,
        Department,
        Total_Spend,
        Basket_Count,
        Transaction_Count,
        Avg_Spend,
        -- Add season calculation
        CASE 
          WHEN Month IN (12, 1, 2) THEN 'Winter'
          WHEN Month IN (3, 4, 5) THEN 'Spring'
          WHEN Month IN (6, 7, 8) THEN 'Summer'
          WHEN Month IN (9, 10, 11) THEN 'Fall'
        END as Season
      FROM MonthlyStats
      ORDER BY Month, Department;
    `;

    const seasonalData = await executeQuery(seasonalQuery);
    return NextResponse.json({ seasonalData });
  } catch (error) {
    console.error('Seasonal analytics query failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasonal analytics data' },
      { status: 500 }
    );
  }
}