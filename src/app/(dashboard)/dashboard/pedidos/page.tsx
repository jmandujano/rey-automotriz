import { prisma } from '@/lib/db';
import Link from 'next/link';

/**
 * Listado de pedidos.
 */
export default async function PedidosPage() {
  const orders = await prisma.pedido.findMany({
    include: {
      cliente: true,
      vendedor: true,
    },
    orderBy: { id_pedido: 'desc' },
  });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">Pedidos</h2>
        <Link
          href="/dashboard/pedidos/nuevo"
          className="px-4 py-2 rounded-md bg-primary text-white hover:bg-primary-dark"
        >
          Nuevo pedido
        </Link>
      </div>
      <div className="overflow-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Vendedor</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id_pedido} className="border-t">
                <td className="px-4 py-2">{o.id_pedido}</td>
                <td className="px-4 py-2">{o.cliente.razon_social}</td>
                <td className="px-4 py-2">{o.vendedor.nombre_completo}</td>
                <td className="px-4 py-2">S/. {o.total.toFixed(2)}</td>
                <td className="px-4 py-2">{o.estado_actual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}