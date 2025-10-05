"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamically import Chart.js to avoid SSR issues
const Bar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Bar), {
  ssr: false,
});

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface CategoriaFinanciera {
  id_categoria_financiera: number;
  nombre_categoria: string;
  tipo_categoria: string;
}

interface MovimientoFinanciero {
  id_movimiento: number;
  tipo_movimiento: string;
  id_categoria_financiera: number | null;
  razon: string;
  monto: string;
  fecha_movimiento: string;
  numero_comprobante?: string | null;
  numero_operacion_bancaria?: string | null;
  descripcion?: string | null;
  id_usuario_registro: number;
  estado_computo: string;
  categoria?: CategoriaFinanciera | null;
}

/**
 * Página del módulo financiero.  Presenta un panel de resumen con
 * indicadores de ingresos vs egresos, un gráfico de barras comparativo
 * y un listado de todos los movimientos financieros.  Además incluye
 * un pequeño formulario para registrar nuevos ingresos o egresos.  Se
 * apoya en los endpoints de la API para obtener datos y persistir
 * registros.
 */
export default function FinanzasPage() {
  const { data: movements, mutate } = useSWR<MovimientoFinanciero[]>(
    '/api/finances',
    fetcher,
  );
  const { data: categories } = useSWR<CategoriaFinanciera[]>(
    '/api/finances/categories',
    fetcher,
  );
  const { data: session } = useSession();

  // Form state
  const [form, setForm] = useState({
    tipo_movimiento: 'ingreso',
    id_categoria_financiera: '' as string,
    razon: '',
    monto: '',
    fecha_movimiento: new Date().toISOString().split('T')[0],
    descripcion: '',
  });
  const [error, setError] = useState<string | null>(null);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await fetch('/api/finances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_movimiento: form.tipo_movimiento,
          id_categoria_financiera: form.id_categoria_financiera
            ? Number(form.id_categoria_financiera)
            : null,
          razon: form.razon,
          monto: parseFloat(form.monto),
          fecha_movimiento: form.fecha_movimiento,
          descripcion: form.descripcion,
          id_usuario_registro: session?.user?.id ? Number(session.user.id) : undefined,
        }),
      });
      // Refresh data
      mutate();
      // Reset form
      setForm({
        tipo_movimiento: 'ingreso',
        id_categoria_financiera: '',
        razon: '',
        monto: '',
        fecha_movimiento: new Date().toISOString().split('T')[0],
        descripcion: '',
      });
    } catch (err: any) {
      setError(err.message);
    }
  }

  // Compute summary totals
  const resumen = { ingresos: 0, egresos: 0 };
  if (movements) {
    movements.forEach((m) => {
      const amount = Number(m.monto);
      if (m.tipo_movimiento === 'ingreso') resumen.ingresos += amount;
      if (m.tipo_movimiento === 'egreso') resumen.egresos += amount;
    });
  }
  const chartData = {
    labels: ['Ingresos', 'Egresos'],
    datasets: [
      {
        label: 'Monto',
        data: [resumen.ingresos, resumen.egresos],
        backgroundColor: ['#1e3a8a', '#b91c1c'],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">Gestión Financiera</h2>
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-white shadow">
          <h3 className="text-lg font-medium text-gray-600">Ingresos</h3>
          <p className="mt-2 text-2xl font-bold text-primary-dark">
            S/. {resumen.ingresos.toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white shadow">
          <h3 className="text-lg font-medium text-gray-600">Egresos</h3>
          <p className="mt-2 text-2xl font-bold text-secondary-dark">
            S/. {resumen.egresos.toFixed(2)}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-white shadow">
          <h3 className="text-lg font-medium text-gray-600">Saldo</h3>
          <p className="mt-2 text-2xl font-bold text-gray-800">
            S/. {(resumen.ingresos - resumen.egresos).toFixed(2)}
          </p>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">
          Comparación Ingresos vs Egresos
        </h3>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>
      {/* New movement form */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">
          Registrar Movimiento Financiero
        </h3>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              name="tipo_movimiento"
              value={form.tipo_movimiento}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              name="id_categoria_financiera"
              value={form.id_categoria_financiera}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">-- Sin categoría --</option>
              {categories
                ?.filter((c) => c.tipo_categoria === form.tipo_movimiento)
                .map((c) => (
                  <option
                    key={c.id_categoria_financiera}
                    value={c.id_categoria_financiera}
                  >
                    {c.nombre_categoria}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Razón</label>
            <input
              type="text"
              name="razon"
              value={form.razon}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Monto (S/.)</label>
            <input
              type="number"
              step="0.01"
              name="monto"
              value={form.monto}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              name="fecha_movimiento"
              value={form.fecha_movimiento}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              rows={2}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
            >
              Registrar
            </button>
          </div>
        </form>
      </div>
      {/* Movements table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">
          Historial de Movimientos
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Categoría
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Razón
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Monto
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements?.map((m) => (
                <tr key={m.id_movimiento} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {m.id_movimiento}
                  </td>
                    <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                      {m.tipo_movimiento}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {m.categoria?.nombre_categoria ?? '—'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {m.razon}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      S/. {Number(m.monto).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {new Date(m.fecha_movimiento).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {m.estado_computo === 'computado' ? 'Activo' : 'No computado'}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements?.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">No hay movimientos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}