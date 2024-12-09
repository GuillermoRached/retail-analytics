'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface DemographicData {
  Income_range: string;
  Hshd_size: number;
  Child_Status: string;
  Household_Count: number;
  Avg_Spend_Per_Transaction: number;
  Total_Spend: number;
  Total_Transactions: number;
}

interface DemographicsChartProps {
  data: DemographicData[];
}

export function DemographicsChart({ data }: DemographicsChartProps) {
  const spendingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const childrenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const spendingChartRef = useRef<Chart | null>(null);
  const childrenChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    // Helper function for chart lifecycle management
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

    // Color scale for household sizes
    const sizeColors = {
      0: 'rgba(54, 162, 235, 0.7)',
      1: 'rgba(255, 99, 132, 0.7)',
      2: 'rgba(255, 206, 86, 0.7)',
      3: 'rgba(75, 192, 192, 0.7)',
      4: 'rgba(153, 102, 255, 0.7)'
    };

    // Create spending by income chart
    if (spendingCanvasRef.current) {
      // Get unique income ranges and household sizes
      const incomeRanges = [...new Set(data.map(d => d.Income_range))];
      const householdSizes = [...new Set(data.map(d => d.Hshd_size))].sort();

      const datasets = householdSizes.map(size => ({
        label: `${size} Member${size > 1 ? 's' : ''}`,
        data: incomeRanges.map(income => {
          const match = data.find(d => 
            d.Income_range === income && 
            d.Hshd_size === size
          );
          return match?.Avg_Spend_Per_Transaction ?? null;
        }),
        backgroundColor: sizeColors[size as keyof typeof sizeColors],
        borderWidth: 1
      }));

      const spendingConfig = {
        type: 'bar' as const,
        data: {
          labels: incomeRanges,
          datasets
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Average Spending by Income Range and Household Size',
              color: '#fff'
            },
            legend: {
              labels: {
                color: '#fff'
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.raw ?? 0;
                  return `Average Spend: ${formatCurrency(value)}`;
                }
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
                callback: (value: any) => formatCurrency(value),
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Income Range',
                color: '#fff'
              },
              ticks: {
                color: '#fff'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      };

      createOrUpdateChart(spendingCanvasRef.current, spendingChartRef, spendingConfig);
    }

    // Create children status chart
    if (childrenCanvasRef.current) {
      // Aggregate data by child status
      const childStatusData = data.reduce((acc, curr) => {
        if (!acc[curr.Child_Status]) {
          acc[curr.Child_Status] = {
            totalSpend: 0,
            totalTransactions: 0
          };
        }
        acc[curr.Child_Status].totalSpend += curr.Total_Spend;
        acc[curr.Child_Status].totalTransactions += curr.Total_Transactions;
        return acc;
      }, {} as Record<string, { totalSpend: number; totalTransactions: number }>);

      // Calculate average spend per transaction for each status
      const chartData = Object.entries(childStatusData).map(([status, data]) => ({
        status,
        avgSpend: data.totalSpend / data.totalTransactions
      }));

      const childrenConfig = {
        type: 'doughnut' as const,
        data: {
          labels: chartData.map(d => d.status),
          datasets: [{
            data: chartData.map(d => d.avgSpend),
            backgroundColor: [
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 99, 132, 0.8)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Average Spending: Households With vs. Without Children',
              color: '#fff'
            },
            legend: {
              labels: {
                color: '#fff'
              }
            },
            tooltip: {
              callbacks: {
                label: (context: any) => {
                  const value = context.raw;
                  return `Average Spend: ${formatCurrency(value)}`;
                }
              }
            }
          }
        }
      };

      createOrUpdateChart(childrenCanvasRef.current, childrenChartRef, childrenConfig);
    }

    // Cleanup function
    return () => {
      if (spendingChartRef.current) {
        spendingChartRef.current.destroy();
      }
      if (childrenChartRef.current) {
        childrenChartRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <canvas ref={spendingCanvasRef} />
      </div>
      <div className="bg-[#1a1a2e] p-4 rounded-lg">
        <canvas ref={childrenCanvasRef} />
      </div>
    </div>
  );
}