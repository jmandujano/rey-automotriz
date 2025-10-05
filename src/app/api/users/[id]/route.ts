import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcrypt';

// GET /api/users/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const user = await prisma.usuario.findUnique({
    where: { id_usuario: id },
    include: { rol: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  const { contrasena_hash, ...safe } = user;
  return NextResponse.json(safe);
}

// PUT /api/users/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  const data = await req.json();
  try {
    if (data.contrasena) {
      const hash = await bcrypt.hash(data.contrasena, 10);
      data.contrasena_hash = hash;
      delete data.contrasena;
    }
    const user = await prisma.usuario.update({
      where: { id_usuario: id },
      data,
    });
    const { contrasena_hash, ...safe } = user;
    return NextResponse.json(safe);
  } catch (err) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  try {
    await prisma.usuario.delete({ where: { id_usuario: id } });
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (err) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
}