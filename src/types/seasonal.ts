// Define possible seasons for type safety
export type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall';

// Define possible months for type safety
export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Map months to their names for better readability
export const MonthNames: Record<Month, string> = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December'
} as const;

// Map months to their seasons for easy reference
export const MonthToSeason: Record<Month, Season> = {
  12: 'Winter',
  1: 'Winter',
  2: 'Winter',
  3: 'Spring',
  4: 'Spring',
  5: 'Spring',
  6: 'Summer',
  7: 'Summer',
  8: 'Summer',
  9: 'Fall',
  10: 'Fall',
  11: 'Fall'
} as const;

// Raw seasonal data as it comes from the database
export interface RawSeasonalData {
  Month: Month;
  Department: string;
  Total_Spend: number;
  Basket_Count: number;
  Transaction_Count: number;
  Avg_Spend: number;
  Season: Season;
}

// Processed seasonal metrics for a specific time period
export interface SeasonalMetrics {
  totalSpend: number;
  basketCount: number;
  transactionCount: number;
  averageSpend: number;
}

// Aggregated seasonal data by department
export interface DepartmentSeasonalData {
  department: string;
  metrics: Record<Season, SeasonalMetrics>;
}

// Monthly trends data structure
export interface MonthlyTrend {
  month: Month;
  monthName: string;
  season: Season;
  metrics: SeasonalMetrics;
}

// Complete seasonal analysis data structure
export interface SeasonalAnalysis {
  monthlyTrends: MonthlyTrend[];
  departmentTrends: DepartmentSeasonalData[];
  seasonalSummary: Record<Season, SeasonalMetrics>;
}

// Helper type for chart data formatting
export interface ChartDataPoint {
  label: string;
  value: number;
  category: string;
}

// Helper functions to work with the types
export const createSeasonalMetrics = (
  totalSpend: number,
  basketCount: number,
  transactionCount: number
): SeasonalMetrics => ({
  totalSpend,
  basketCount,
  transactionCount,
  averageSpend: transactionCount > 0 ? totalSpend / transactionCount : 0
});

export const getEmptySeasonalMetrics = (): SeasonalMetrics => ({
  totalSpend: 0,
  basketCount: 0,
  transactionCount: 0,
  averageSpend: 0
});

// Function to process raw seasonal data into the analysis format
export const processSeasonalData = (rawData: RawSeasonalData[]): SeasonalAnalysis => {
  // Initialize empty seasonal metrics for each season
  const seasonalSummary: Record<Season, SeasonalMetrics> = {
    Winter: getEmptySeasonalMetrics(),
    Spring: getEmptySeasonalMetrics(),
    Summer: getEmptySeasonalMetrics(),
    Fall: getEmptySeasonalMetrics()
  };

  // Process monthly trends
  const monthlyTrends = Object.keys(MonthNames).map(month => {
    const monthNum = Number(month) as Month;
    const monthData = rawData.filter(d => d.Month === monthNum);
    
    const metrics = monthData.reduce(
      (acc, curr) => ({
        totalSpend: acc.totalSpend + curr.Total_Spend,
        basketCount: acc.basketCount + curr.Basket_Count,
        transactionCount: acc.transactionCount + curr.Transaction_Count,
        averageSpend: 0 // Will be calculated after reduction
      }),
      getEmptySeasonalMetrics()
    );

    // Calculate average spend
    metrics.averageSpend = metrics.transactionCount > 0 
      ? metrics.totalSpend / metrics.transactionCount 
      : 0;

    return {
      month: monthNum,
      monthName: MonthNames[monthNum],
      season: MonthToSeason[monthNum],
      metrics
    };
  });

  // Process department trends
  const departments = [...new Set(rawData.map(d => d.Department))];
  const departmentTrends = departments.map(department => {
    const departmentData = rawData.filter(d => d.Department === department);
    const metrics = {
      Winter: getEmptySeasonalMetrics(),
      Spring: getEmptySeasonalMetrics(),
      Summer: getEmptySeasonalMetrics(),
      Fall: getEmptySeasonalMetrics()
    };

    departmentData.forEach(data => {
      const season = data.Season;
      metrics[season].totalSpend += data.Total_Spend;
      metrics[season].basketCount += data.Basket_Count;
      metrics[season].transactionCount += data.Transaction_Count;
    });

    // Calculate averages
    Object.values(metrics).forEach(metric => {
      metric.averageSpend = metric.transactionCount > 0 
        ? metric.totalSpend / metric.transactionCount 
        : 0;
    });

    return {
      department,
      metrics
    };
  });

  return {
    monthlyTrends,
    departmentTrends,
    seasonalSummary
  };
};