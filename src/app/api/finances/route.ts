import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/finances
// Returns a list of financial movements, including category and user information.
export async function GET() {
  const movements = await prisma.movimientoFinanciero.findMany({
    include: {
      categoria: true,
      usuario: { select: { id_usuario: true, nombre_completo: true } },
      movimientoPedidos: true,
    },
    orderBy: { id_movimiento: 'desc' },
  });
  return NextResponse.json(movements);
}

// POST /api/finances
// Creates a new financial movement. Body: { tipo_movimiento, id_categoria_financiera, razon, monto, fecha_movimiento, descripcion, id_usuario_registro }
export async function POST(req: NextRequest) {
  const data = await req.json();
  const {
    tipo_movimiento,
    id_categoria_financiera,
    razon,
    monto,
    fecha_movimiento,
    numero_comprobante,
    numero_operacion_bancaria,
    descripcion,
    id_usuario_registro,
  } = data;
  if (!tipo_movimiento || !razon || !monto || !fecha_movimiento || !id_usuario_registro) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  try {
    const movement = await prisma.movimientoFinanciero.create({
      data: {
        tipo_movimiento,
        id_categoria_financiera: id_categoria_financiera ?? null,
        razon,
        monto,
        fecha_movimiento: new Date(fecha_movimiento),
        numero_comprobante: numero_comprobante ?? null,
        numero_operacion_bancaria: numero_operacion_bancaria ?? null,
        descripcion: descripcion ?? null,
        id_usuario_registro,
      },
    });
    return NextResponse.json(movement, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error al registrar movimiento' }, { status: 500 });
  }
}