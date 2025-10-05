"use client";

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface User {
  id_usuario: number;
  nombre_completo: string;
}

interface Client {
  id_cliente: number;
  razon_social: string;
}

interface OrdersReport {
  totalPedidos: number;
  montoTotal: number;
  montoPagado: number;
  montoPendiente: number;
  pedidos: Array<{
    id_pedido: number;
    fecha: string;
    vendedor: string;
    cliente: string;
    tipo_pago: string;
    tipo_comprobante: string;
    total: number;
    pagado: number;
    pendiente: number;
  }>;
}

interface CreditsReport {
  totalCreditos: number;
  montoTotalCreditos: number;
  montoPagadoCreditos: number;
  montoPendienteCreditos: number;
  cuotas: Array<{
    id_pedido: number;
    numero_cuota: number;
    fecha_pago: string;
    dias_retraso: number;
    monto: number;
    pagado: number;
    pendiente: number;
    estado: string;
    vendedor: string;
    cliente: string;
  }>;
}

/**
 * Página de reportería.  Permite a los usuarios (administradores o
 * vendedores) generar reportes de pedidos y créditos filtrando por
 * rangos de fechas, vendedor y cliente.  Los totales se recalculan en
 * función de los filtros, siguiendo los requisitos del FRD módulo 6【250385542692500†L1290-L1349】.
 */
export default function ReportesPage() {
  // Filtros de búsqueda
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [cliente, setCliente] = useState('');

  // Construir query string para los endpoints
  const query = new URLSearchParams();
  if (startDate) query.append('startDate', startDate);
  if (endDate) query.append('endDate', endDate);
  if (vendedor) query.append('vendedor', vendedor);
  if (cliente) query.append('cliente', cliente);
  const ordersUrl = `/api/reports/orders${query.toString() ? `?${query.toString()}` : ''}`;
  const creditsUrl = `/api/reports/credits${query.toString() ? `?${query.toString()}` : ''}`;

  const { data: orders } = useSWR<OrdersReport>(ordersUrl, fetcher);
  const { data: credits } = useSWR<CreditsReport>(creditsUrl, fetcher);
  const { data: users } = useSWR<User[]>('/api/users', fetcher);
  const { data: clients } = useSWR<Client[]>('/api/clients', fetcher);

  // Reset end date when start date > end date
  useEffect(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">Reportes</h2>
      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vendedor</label>
            <select
              value={vendedor}
              onChange={(e) => setVendedor(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Todos</option>
              {users?.map((u) => (
                <option key={u.id_usuario} value={u.id_usuario.toString()}>
                  {u.nombre_completo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="">Todos</option>
              {clients?.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente.toString()}>
                  {c.razon_social}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      {/* Reporte de pedidos */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">Reporte de Pedidos</h3>
        {orders ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Total de Pedidos</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {orders.totalPedidos}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Monto Total (S/.)</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {orders.montoTotal.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Pagado/Pendiente</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {orders.montoPagado.toFixed(2)} / {orders.montoPendiente.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendedor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Tipo de Pago
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Pagado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Pendiente
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.pedidos.map((p) => (
                    <tr key={p.id_pedido} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">{p.id_pedido}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(p.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.vendedor}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{p.cliente}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {p.tipo_pago}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {p.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {p.pagado.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {p.pendiente.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.pedidos.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No se encontraron pedidos.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Cargando...</p>
        )}
      </div>
      {/* Reporte de créditos */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">Reporte de Créditos</h3>
        {credits ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Total de Créditos</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {credits.totalCreditos}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Monto Total (S/.)</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {credits.montoTotalCreditos.toFixed(2)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500">Pagado/Pendiente</h4>
                <p className="mt-1 text-xl font-bold text-gray-800">
                  {credits.montoPagadoCreditos.toFixed(2)} /{' '}
                  {credits.montoPendienteCreditos.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Pedido
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cuota
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha de Pago
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Días de Retraso
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Pagado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Pendiente
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Vendedor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {credits.cuotas.map((c, idx) => (
                    <tr key={`${c.id_pedido}-${c.numero_cuota}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">{c.id_pedido}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.numero_cuota}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(c.fecha_pago).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.dias_retraso}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {c.monto.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {c.pagado.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        S/. {c.pendiente.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                        {c.estado}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.vendedor}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{c.cliente}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {credits.cuotas.length === 0 && (
                <p className="text-sm text-gray-500 mt-4">No se encontraron créditos.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Cargando...</p>
        )}
      </div>
    </div>
  );
}