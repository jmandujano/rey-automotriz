import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/products
 *
 * Returns a list of all products with their categories. This endpoint is
 * intended for listing products in the UI. It excludes heavy relations
 * such as images or importations for performance reasons.
 */
export async function GET() {
  const products = await prisma.producto.findMany({
    include: {
      categoria: true,
    },
    orderBy: { id_producto: 'asc' },
  });
  return NextResponse.json(products);
}

/**
 * POST /api/products
 *
 * Creates a new product. The request body must contain `codigo_producto`,
 * `descripcion` and `id_categoria`. The `estado` field is optional and
 * defaults to `activo`. Other related models (importaciones, porcentajes,
 * imágenes) should be created via their respective endpoints.
 */
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const {
      codigo_producto,
      descripcion,
      id_categoria,
      estado,
      // campos para importación
      id_proveedor,
      precio_compra,
      stock,
      fecha_importacion,
      // campos para imagen
      imagen_nombre_archivo,
      imagen_ruta_archivo,
      // lista de imágenes opcionales (múltiples)
      imagenes,
      // campos para porcentaje y precio de venta
      precio_venta,
      porcentaje_margen,
      porcentaje_comision,
    } = data;
    if (!codigo_producto || !descripcion || !id_categoria) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }
    const existing = await prisma.producto.findUnique({ where: { codigo_producto } });
    if (existing) {
      return NextResponse.json({ error: 'El código de producto ya existe' }, { status: 409 });
    }
    // Create product record
    const product = await prisma.producto.create({
      data: {
        codigo_producto,
        descripcion,
        id_categoria,
        estado: estado ?? 'activo',
      },
    });
    const tasks: Promise<any>[] = [];
    // If importation details provided, create an import record
    if (id_proveedor && precio_compra && stock !== undefined) {
      const importDate = fecha_importacion ? new Date(fecha_importacion) : new Date();
      tasks.push(
        prisma.productoImportacion.create({
          data: {
            id_producto: product.id_producto,
            id_proveedor,
            fecha_importacion: importDate,
            precio_compra,
//            stock,
//            estado_importacion: 'activa',
//          },
//        }),
//      );
//    }
//    // If image details provided, create an image record.  We only persist the path and filename.
//    if (imagen_ruta_archivo) {
//      tasks.push(
//        prisma.productoImagen.create({
//          data: {
//            id_producto: product.id_producto,
//            nombre_archivo: imagen_nombre_archivo ?? '',
            ruta_archivo: imagen_ruta_archivo,
      // lista de imágenes opcionales (múltiples)
      imagenes,
      // campos para porcentaje y precio de venta
      precio_venta,
      porcentaje_margen,
      porcentaje_comision,
            orden_visualizacion: 1,
          },
        }),
      );
    }
    if (tasks.length) {
      await Promise.all(tasks);
    }
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}