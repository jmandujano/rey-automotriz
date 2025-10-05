import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/clients
// Returns a list of clients with their id and razon_social. Only active clients are returned.
export async function GET() {
  const clients = await prisma.cliente.findMany({
    where: { estado: 'activo' },
    include: {
      vendedor: {
        select: {
          id_usuario: true,
          nombre_completo: true,
        },
      },
    },
    orderBy: { razon_social: 'asc' },
  });
  return NextResponse.json(clients);
}

// POST /api/clients
// Creates a new client. Requires razon_social, correo_electronico and id_vendedor_asignado
// along with optional fields such as ruc, nombre_representante, fecha de cumpleaños
// and contact information. Unrecognized fields are ignored.
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      id_vendedor_asignado,
      ruc,
      razon_social,
      nombre_representante,
      cumpleanos_representante,
      correo_electronico,
      telefono_principal,
      telefono_secundario,
      dni_representante,
      tipo_cliente,
      departamento,
      provincia,
      distrito,
      direccion,
      estado,
    } = data;
    if (!razon_social || !correo_electronico || !id_vendedor_asignado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    // Ensure email uniqueness
    const existing = await prisma.cliente.findUnique({ where: { correo_electronico } });
    if (existing) {
      return NextResponse.json({ error: 'El correo del cliente ya existe' }, { status: 409 });
    }
    const client = await prisma.cliente.create({
      data: {
        id_vendedor_asignado,
        ruc,
        razon_social,
        nombre_representante,
        cumpleanos_representante: cumpleanos_representante ? new Date(cumpleanos_representante) : null,
        correo_electronico,
        telefono_principal,
        telefono_secundario,
        dni_representante,
        tipo_cliente,
        departamento,
        provincia,
        distrito,
        direccion,
        estado: estado ?? 'activo',
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}