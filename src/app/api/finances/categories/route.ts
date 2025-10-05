import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * API endpoint to manage financial categories.  These categories are used to
 * classify income and expense movements (ingresos y egresos).  The underlying
 * table is `categorias_financieras`.  Only two values are currently valid for
 * `tipo_categoria`: "ingreso" and "egreso".  A category may not be deleted if
 * there are movements referencing it.  See FRD módulo 5, requisito 5.5 for
 * details【250385542692500†L1255-L1236】.
 */

// GET /api/finances/categories
// Returns the list of all financial categories.
export async function GET() {
  const categories = await prisma.categoriaFinanciera.findMany({
    orderBy: { id_categoria_financiera: 'asc' },
  });
  return NextResponse.json(categories);
}

// POST /api/finances/categories
// Creates a new financial category.  Expects a JSON body with
// { nombre_categoria: string, tipo_categoria: 'ingreso'|'egreso', descripcion?: string }
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { nombre_categoria, tipo_categoria, descripcion } = data;
  if (!nombre_categoria || !tipo_categoria) {
    return NextResponse.json(
      { error: 'Nombre y tipo de categoría son obligatorios' },
      { status: 400 },
    );
  }
  if (!['ingreso', 'egreso'].includes(tipo_categoria)) {
    return NextResponse.json(
      { error: 'Tipo de categoría no válido' },
      { status: 400 },
    );
  }
  try {
    const category = await prisma.categoriaFinanciera.create({
      data: {
        nombre_categoria,
        tipo_categoria,
        descripcion: descripcion ?? null,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: 'Error al crear la categoría financiera' },
      { status: 500 },
    );
  }
}
