'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface SpendingChartProps {
  data: {
    date: string;
    spend: number;
  }[];
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Create a new chart instance with our data
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Daily Spending ($)',
          data: data.map(d => d.spend),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Household Spending Over Time',
            font: {
              size: 16,
              weight: 'bold'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => `Spending: $${context.parsed.y.toFixed(2)}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Spending ($)',
              font: {
                weight: 'bold'
              }
            },
            ticks: {
              callback: (value) => `$${value}`
            }
          },
          x: {
            title: {
              display: true,
              text: 'Date',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      }
    });

    // Cleanup function to destroy the chart when the component unmounts
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]); // We only recreate the chart when the data changes

  return (
    <canvas ref={canvasRef} className="w-full h-full" />
  );
}