// src/app/api/household/[id]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

type houseHoldParams = {
  params: Promise<{id: string}>
}

export async function GET(
  request: Request,
  props: houseHoldParams
) {
  try {
    const {id} = await props.params;
    const query = `
      SELECT 
        h.Hshd_num,
        t.Basket_num,
        t.Purchase_Date as Date,
        t.Product_num,
        p.Department,
        p.Commodity,
        t.Spend,
        t.Units,
        t.Store_region,
        t.Week_num,
        t.Year,
        h.Loyalty_flag,
        h.Age_range,
        h.Marital_status,
        h.Income_range,
        h.Homeowner_desc,
        h.Hshd_composition,
        h.Hshd_size,
        h.Children
      FROM Households h
      INNER JOIN Transactions t ON h.Hshd_num = t.Hshd_num
      INNER JOIN Products p ON t.Product_num = p.Product_num
      WHERE h.Hshd_num = @householdId
      ORDER BY 
        h.Hshd_num,
        t.Basket_num,
        t.Purchase_Date,
        t.Product_num,
        p.Department,
        p.Commodity
    `;

    const results = await executeQuery(query, { householdId: id });
    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch household data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch household data' },
      { status: 500 }
    );
  }
}