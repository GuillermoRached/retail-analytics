// src/components/SpendingChart.tsx
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
  // We use a ref to store references to both the canvas and chart instance
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    // If we don't have a canvas element, we can't create a chart
    if (!canvasRef.current) return;

    // If we already have a chart, destroy it before creating a new one
    // This prevents memory leaks and ensures clean re-renders
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Get the 2D context from our canvas element
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