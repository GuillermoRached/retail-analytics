// src/components/SeasonalTrendsChart.tsx
'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface SeasonalData {
  Month: number;
  Department: string;
  Total_Spend: number;
  Basket_Count: number;
  Transaction_Count: number;
  Avg_Spend: number;
  Season: string;
}

interface SeasonalTrendsChartProps {
  data: SeasonalData[];
}

export function SeasonalTrendsChart({ data }: SeasonalTrendsChartProps) {
  const monthlySpendingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const departmentTrendsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const monthlyChartRef = useRef<Chart | null>(null);
  const departmentChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Helper function for managing chart lifecycle
    const createOrUpdateChart = (
      canvas: HTMLCanvasElement,
      chartRef: React.MutableRefObject<Chart | null>,
      config: any
    ) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
      const ctx = canvas.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, config);
      }
    };

    // Helper function for currency formatting
    const formatCurrency = (value: number) => 
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);

    // Create monthly spending trends chart
    if (monthlySpendingCanvasRef.current) {
      // Calculate total spending per month across all departments
      const monthlyTotals = data.reduce((acc, curr) => {
        if (!acc[curr.Month]) {
          acc[curr.Month] = { total: 0, count: 0 };
        }
        acc[curr.Month].total += curr.Total_Spend;
        acc[curr.Month].count += curr.Transaction_Count;
        return acc;
      }, {} as Record<number, { total: number; count: number }>);

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      const monthlyConfig = {
        type: 'line' as const,
        data: {
          labels: monthNames,
          datasets: [{
            label: 'Average Monthly Spending',
            data: monthNames.map((_, index) => {
              const monthData = monthlyTotals[index + 1];
              return monthData ? monthData.total / monthData.count : 0;
            }),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Monthly Spending Patterns',
              color: '#fff'
            },
            legend: {
              labels: { color: '#fff' }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => `Average Spend: ${formatCurrency(context.raw)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Average Spend per Transaction',
                color: '#fff'
              },
              ticks: {
                callback: (value) => formatCurrency(Number(value)),
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Month',
                color: '#fff'
              },
              ticks: { color: '#fff' },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      };

      createOrUpdateChart(monthlySpendingCanvasRef.current, monthlyChartRef, monthlyConfig);
    }

    // Create department seasonal trends chart
    if (departmentTrendsCanvasRef.current) {
      const departments = [...new Set(data.map(d => d.Department))];
      const seasons = ['Winter', 'Spring', 'Summer', 'Fall'];

      // Calculate average spending by department and season
      const seasonalDepartmentData = departments.map(dept => {
        const seasonalAverages = seasons.map(season => {
          const seasonData = data.filter(d => 
            d.Department === dept && d.Season === season
          );
          if (seasonData.length === 0) return 0;
          const totalSpend = seasonData.reduce((sum, d) => sum + d.Total_Spend, 0);
          const totalTransactions = seasonData.reduce((sum, d) => sum + d.Transaction_Count, 0);
          return totalSpend / totalTransactions;
        });

        return {
          label: dept,
          data: seasonalAverages,
          borderWidth: 1
        };
      });

      const departmentConfig = {
        type: 'bar' as const,
        data: {
          labels: seasons,
          datasets: seasonalDepartmentData
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Seasonal Department Performance',
              color: '#fff'
            },
            legend: {
              labels: { color: '#fff' }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => 
                  `${context.dataset.label}: ${formatCurrency(context.raw)}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Average Spend per Transaction',
                color: '#fff'
              },
              ticks: {
                callback: (value) => formatCurrency(Number(value)),
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Season',
                color: '#fff'
              },
              ticks: { color: '#fff' },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      };

      createOrUpdateChart(departmentTrendsCanvasRef.current, departmentChartRef, departmentConfig);
    }

    return () => {
      if (monthlyChartRef.current) {
        monthlyChartRef.current.destroy();
      }
      if (departmentChartRef.current) {
        departmentChartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <canvas ref={monthlySpendingCanvasRef} />
      </div>
      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <canvas ref={departmentTrendsCanvasRef} />
      </div>
    </div>
  );
}