import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API endpoint for the credit payments report.  Provides aggregated metrics and
 * detailed list of credit installments (cuotas) associated to orders.  Filters
 * by date range, seller and client.  See FRD módulo 6, reporte de créditos【250385542692500†L1297-L1354】.
 */

function parseOptionalInt(value: string | null): number | undefined {
  if (!value) return undefined;
  const num = parseInt(value, 10);
  return isNaN(num) ? undefined : num;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const vendedorId = parseOptionalInt(searchParams.get('vendedor'));
  const clienteId = parseOptionalInt(searchParams.get('cliente'));
  let dateFilter: any = {};
  if (startDateStr) dateFilter.gte = new Date(startDateStr);
  if (endDateStr) {
    const end = new Date(endDateStr);
    end.setDate(end.getDate() + 1);
    dateFilter.lte = end;
  }
  const where: any = {};
  // We'll filter by pedido.fecha_creacion later; for cuotas we filter by fecha_pago_programada
  if (Object.keys(dateFilter).length > 0) {
    where.fecha_pago_programada = dateFilter;
  }
  // Include related Pedido (order) with seller and client
  const cuotas = await prisma.pedidoPago.findMany({
    where,
    include: {
      pedido: {
        include: {
          vendedor: { select: { id_usuario: true, nombre_completo: true } },
          cliente: { select: { id_cliente: true, nombre_completo: true } },
        },
      },
    },
    orderBy: { id_pago: 'desc' },
  });
  // Apply additional filters by seller and client
  const filtered = cuotas.filter((cuota) => {
    if (vendedorId !== undefined && cuota.pedido.id_vendedor !== vendedorId) return false;
    if (clienteId !== undefined && cuota.pedido.id_cliente !== clienteId) return false;
    return true;
  });
  // Aggregate metrics
  let totalCreditos = 0;
  let montoTotalCreditos = 0;
  let montoPagadoCreditos = 0;
  let montoPendienteCreditos = 0;
  const listado = filtered.map((cuota) => {
    totalCreditos++;
    const total = Number(cuota.monto_cuota);
    const pagado = Number(cuota.monto_pagado);
    const pendiente = Number(cuota.saldo_pendiente);
    montoTotalCreditos += total;
    montoPagadoCreditos += pagado;
    montoPendienteCreditos += pendiente;
    return {
      id_pedido: cuota.id_pedido,
      numero_cuota: cuota.numero_cuota,
      fecha_pago: cuota.fecha_pago_programada,
      dias_retraso: cuota.estado_pago === 'pendiente' && cuota.fecha_pago_programada < new Date() ?
        Math.floor((Date.now() - cuota.fecha_pago_programada.getTime()) / (1000 * 60 * 60 * 24)) : 0,
      monto: total,
      pagado,
      pendiente,
      estado: cuota.estado_pago,
      vendedor: cuota.pedido.vendedor?.nombre_completo ?? 'N/A',
      cliente: cuota.pedido.cliente?.nombre_completo ?? 'N/A',
    };
  });
  const response = {
    totalCreditos,
    montoTotalCreditos,
    montoPagadoCreditos,
    montoPendienteCreditos,
    cuotas: listado,
  };
  return NextResponse.json(response);
}
