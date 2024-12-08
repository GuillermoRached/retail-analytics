// src/app/api/household/[id]/route.ts
import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/db'

interface HouseholdRecord {
  Hshd_num: number
  Loyalty_flag: string
  Basket_num: number
  Purchase_Date: Date
  Product_num: string
  Department: string
  Commodity: string
  // Add other fields as needed
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {id} = await params;
    const query = `
      SELECT 
        h.Hshd_num,
        h.Loyalty_flag,
        h.Age_range,
        h.Marital_status,
        h.Income_range,
        h.Homeowner_desc,
        h.Hshd_composition,
        h.Hshd_size,
        h.Children,
        t.Basket_num,
        t.Purchase_Date as Date,
        t.Product_num,
        p.Department,
        p.Commodity,
        t.Spend,
        t.Units,
        t.Store_region,
        t.Week_num,
        t.Year
      FROM Households h
      INNER JOIN Transactions t ON h.Hshd_num = t.Hshd_num
      INNER JOIN Products p ON t.Product_num = p.Product_num
      WHERE h.Hshd_num = @householdId
      ORDER BY h.Hshd_num, t.Basket_num, t.Purchase_Date, 
               t.Product_num, p.Department, p.Commodity
    `;

    // Pass the parameter as an object with the parameter name matching the @parameter in the query
    const results = await executeQuery<HouseholdRecord>(query, {
      householdId: parseInt(id)
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch household data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch household data' },
      { status: 500 }
    );
  }
}