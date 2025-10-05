import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/orders
// Returns a list of orders with client and vendor information.
export async function GET() {
  const orders = await prisma.pedido.findMany({
    include: {
      cliente: true,
      vendedor: { select: { id_usuario: true, nombre_completo: true } },
    },
    orderBy: { id_pedido: 'desc' },
  });
  return NextResponse.json(orders);
}

// POST /api/orders
// Creates a new order with one or more items. The request body should
// include id_cliente, id_vendedor, tipo_pago, tipo_comprobante and an
// array `items` with objects { id_producto, cantidad, precio_unitario }.
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { id_cliente, id_vendedor, tipo_pago, tipo_comprobante, items, observaciones } = data;
    if (!id_cliente || !id_vendedor || !tipo_pago || !tipo_comprobante || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    // Calculate totals
    let subtotal = 0;
    const detalles = items.map((item: any) => {
      const lineSubtotal = Number(item.precio_unitario) * Number(item.cantidad);
      subtotal += lineSubtotal;
      return {
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        descuento_porcentaje: 0,
        descuento_monto: 0,
        subtotal: lineSubtotal,
        porcentaje_comision: 0,
        monto_comision: 0,
      };
    });
    const igv = subtotal * 0.18;
    const total = subtotal + igv;
    const order = await prisma.pedido.create({
      data: {
        id_cliente,
        id_vendedor,
        tipo_pago,
        tipo_comprobante,
        subtotal,
        igv,
        total,
        observaciones: observaciones ?? null,
        id_usuario_creacion: id_vendedor,
        detalles: {
          create: detalles,
        },
      },
      include: {
        detalles: true,
      },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Error al crear pedido' }, { status: 500 });
  }
}