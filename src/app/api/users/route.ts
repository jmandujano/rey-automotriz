import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/users
// Returns a list of system users (excluding clients). Sensitive fields
// such as password hashes are omitted.
export async function GET() {
  const users = await prisma.usuario.findMany({
    include: { rol: true },
    orderBy: { id_usuario: 'asc' },
  });
  const safeUsers = users.map((u) => ({
    id_usuario: u.id_usuario,
    correo_electronico: u.correo_electronico,
    nombre_completo: u.nombre_completo,
    estado: u.estado,
    rol: u.rol,
    fecha_creacion: u.fecha_creacion,
  }));
  return NextResponse.json(safeUsers);
}

// POST /api/users
// Creates a new user. Requires correo_electronico, nombre_completo,
// contrasena and id_rol.
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { correo_electronico, nombre_completo, contrasena, id_rol, estado } = data;
  if (!correo_electronico || !nombre_completo || !contrasena || !id_rol) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  const existing = await prisma.usuario.findUnique({ where: { correo_electronico } });
  if (existing) {
    return NextResponse.json({ error: 'El correo ya existe' }, { status: 409 });
  }
  const hash = await bcrypt.hash(contrasena, 10);
  const user = await prisma.usuario.create({
    data: {
      correo_electronico: correo_electronico.toLowerCase(),
      contrasena_hash: hash,
      nombre_completo,
      id_rol,
      estado: estado ?? 'activo',
    },
  });
  return NextResponse.json({
    id_usuario: user.id_usuario,
    correo_electronico: user.correo_electronico,
    nombre_completo: user.nombre_completo,
    estado: user.estado,
  }, { status: 201 });
}