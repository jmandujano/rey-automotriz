"use client";

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export interface BarChartProps {
  labels: string[];
  ingresos: number[];
  egresos: number[];
}

/**
 * Simple bar chart comparing ingresos vs egresos. Receives arrays of
 * numbers corresponding to the labels. If the arrays are not of
 * equal length they are padded with zeros.
 */
export default function BarChart({ labels, ingresos, egresos }: BarChartProps) {
  // Ensure arrays are equal length
  const maxLength = Math.max(labels.length, ingresos.length, egresos.length);
  const paddedIngresos = [...ingresos];
  const paddedEgresos = [...egresos];
  while (paddedIngresos.length < maxLength) paddedIngresos.push(0);
  while (paddedEgresos.length < maxLength) paddedEgresos.push(0);
  const paddedLabels = [...labels];
  while (paddedLabels.length < maxLength) paddedLabels.push('');

  const data = {
    labels: paddedLabels,
    datasets: [
      {
        label: 'Ingresos',
        data: paddedIngresos,
        backgroundColor: '#012BA4',
      },
      {
        label: 'Egresos',
        data: paddedEgresos,
        backgroundColor: '#E8002B',
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' } as const,
      title: { display: false, text: '' },
    },
  };
  return <Bar data={data} options={options} />;
}