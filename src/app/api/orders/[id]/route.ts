import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/orders/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const order = await prisma.pedido.findUnique({
    where: { id_pedido: id },
    include: {
      cliente: true,
      vendedor: true,
      detalles: { include: { producto: true } },
      pagos: true,
      historial: true,
    },
  });
  if (!order) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
  return NextResponse.json(order);
}

// PUT /api/orders/[id]
// Updates an existing order. Accepts partial fields on the request body.
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const data = await req.json();
  try {
    const order = await prisma.pedido.update({
      where: { id_pedido: id },
      data,
    });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
}

// DELETE /api/orders/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  try {
    await prisma.pedido.delete({ where: { id_pedido: id } });
    return NextResponse.json({ message: 'Pedido eliminado' });
  } catch (err) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }
}