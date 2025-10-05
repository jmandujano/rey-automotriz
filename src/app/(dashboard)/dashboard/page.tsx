import { prisma } from '@/lib/db';
import dynamic from 'next/dynamic';

// Dynamically import the bar chart since Chart.js requires the DOM. The
// `ssr: false` option ensures the component only renders on the client.
const BarChart = dynamic(() => import('@/components/charts/BarChart'), {
  ssr: false,
});

/**
 * Dashboard overview page.
 *
 * This page runs on the server by default. It queries aggregated
 * statistics directly from the database using Prisma and passes
 * primitive values to a dynamically loaded bar chart component. The
 * bar chart compares total ingresos vs egresos.
 */
export default async function DashboardPage() {
  const [productsCount, usersCount, ordersCount, returnsCount, ingresos, egresos] =
    await Promise.all([
      prisma.producto.count(),
      prisma.usuario.count(),
      prisma.pedido.count(),
      prisma.devolucion.count(),
      prisma.movimientoFinanciero.aggregate({
        _sum: { monto: true },
        where: { tipo_movimiento: 'ingreso' },
      }),
      prisma.movimientoFinanciero.aggregate({
        _sum: { monto: true },
        where: { tipo_movimiento: 'egreso' },
      }),
    ]);
  const totalIngresos = ingresos._sum.monto ?? 0;
  const totalEgresos = egresos._sum.monto ?? 0;
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-primary">Panel de Control</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white shadow rounded-lg">
          <p className="text-sm text-neutral-500">Productos</p>
          <p className="text-3xl font-semibold text-primary">{productsCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <p className="text-sm text-neutral-500">Usuarios</p>
          <p className="text-3xl font-semibold text-primary">{usersCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <p className="text-sm text-neutral-500">Pedidos</p>
          <p className="text-3xl font-semibold text-primary">{ordersCount}</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <p className="text-sm text-neutral-500">Devoluciones</p>
          <p className="text-3xl font-semibold text-primary">{returnsCount}</p>
        </div>
      </div>
      <div className="p-4 bg-white shadow rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Resumen financiero</h3>
        <div className="flex items-center space-x-8">
          <div>
            <p className="text-sm text-neutral-500">Ingresos totales</p>
            <p className="text-2xl font-semibold text-green-600">
              S/. {totalIngresos.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-500">Egresos totales</p>
            <p className="text-2xl font-semibold text-red-600">
              S/. {totalEgresos.toFixed(2)}
            </p>
          </div>
        </div>
        {/* Chart comparing ingresos vs egresos */}
        <div className="mt-6">
          <BarChart labels={["Movimientos"]} ingresos={[Number(totalIngresos)]} egresos={[Number(totalEgresos)]} />
        </div>
      </div>
    </div>
  );
}