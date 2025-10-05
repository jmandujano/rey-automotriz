import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/products/[id]
 *
 * Retrieves a single product by its identifier. Includes category and
 * sale percentages. If the product does not exist a 404 response is
 * returned.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const product = await prisma.producto.findUnique({
    where: { id_producto: id },
    include: {
      categoria: true,
      porcentajesVenta: true,
    },
  });
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  return NextResponse.json(product);
}

/**
 * PUT /api/products/[id]
 *
 * Updates an existing product. Only the fields provided in the
 * request body will be updated. If the product does not exist, a 404
 * response is returned.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const data = await req.json();
  try {
    const product = await prisma.producto.update({
      where: { id_producto: id },
      data,
    });
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
}

/**
 * DELETE /api/products/[id]
 *
 * Removes a product from the database. Related rows such as
 * importaciones or porcentajes are cascaded at the database level.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  try {
    await prisma.producto.delete({ where: { id_producto: id } });
    return NextResponse.json({ message: 'Producto eliminado' });
  } catch (err) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
}