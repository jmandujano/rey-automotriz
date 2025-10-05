"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Esquema de validación para productos con campos de tablas relacionadas.
const productSchema = z.object({
  codigo_producto: z.string().min(1, { message: 'Requerido' }),
  descripcion: z.string().min(1, { message: 'Requerido' }),
  id_categoria: z.string().min(1, { message: 'Requerido' }),
  estado: z.string().optional(),
  id_proveedor: z.string().optional(),
  precio_compra: z.coerce.number().optional(),
  stock: z.coerce.number().optional(),
  fecha_importacion: z.string().optional(),
  id_almacen: z.string().optional(),
  estado_importacion: z.string().optional(),
  imagen: z.any().optional(),
});

// Tipo inferido a partir del esquema
export type ProductForm = z.infer<typeof productSchema>;

export default function NuevoProductoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  // Carga inicial de datos (categorías, proveedores, almacenes)
  useEffect(() => {
  async function loadData() {
    const catRes = await fetch('/api/categories');
    if (catRes.ok) {
      const cats = await catRes.json();
      setCategories(cats);
    }
    const provRes = await fetch('/api/providers');
    if (provRes.ok) {
      const provs = await provRes.json();
      setProviders(provs);
    }
    const whRes = await fetch('/api/warehouses');
    if (whRes.ok) {
      const whs = await whRes.json();
      setWarehouses(whs);
    }
  }
  loadData();
  }, []);

  // Envío del formulario
  const onSubmit = async (data: ProductForm) => {
    setErrorMessage(null);
    const payload: any = {
      codigo_producto: data.codigo_producto,
      descripcion: data.descripcion,
      id_categoria: parseInt(data.id_categoria, 10),
    };
    if (data.estado) {
      payload.estado = data.estado;
    }
    if (data.id_proveedor) {
      payload.id_proveedor = parseInt(data.id_proveedor, 10);
    }
    if (data.precio_compra !== undefined && !Number.isNaN(data.precio_compra)) {
      payload.precio_compra = data.precio_compra;
    }
    if (data.stock !== undefined && !Number.isNaN(data.stock)) {
      payload.stock = data.stock;
    }
    if (data.fecha_importacion) {
      payload.fecha_importacion = data.fecha_importacion;
    }
    if (data.id_almacen) {
      payload.id_almacen = parseInt(data.id_almacen, 10);
    }
    if (data.estado_importacion) {
      payload.estado_importacion = data.estado_importacion;
    }
    if (data.imagen && data.imagen.length > 0) {
      const file: File = data.imagen[0];
      payload.imagen_nombre_archivo = file.name;
      payload.imagen_ruta_archivo = `/uploads/${file.name}`;
    }
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/dashboard/productos');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nuevo Producto</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="codigo_producto">
            Código de producto
          </label>
          <input
            id="codigo_producto"
            type="text"
            {...register('codigo_producto')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.codigo_producto && (
            <p className="mt-1 text-xs text-secondary">{errors.codigo_producto.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="descripcion">
            Descripción
          </label>
          <textarea
            id="descripcion"
            {...register('descripcion')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.descripcion && (
            <p className="mt-1 text-xs text-secondary">{errors.descripcion.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_categoria">
            Categoría
          </label>
          <select
            id="id_categoria"
            {...register('id_categoria')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
          {errors.id_categoria && (
            <p className="mt-1 text-xs text-secondary">{errors.id_categoria.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="estado">
            Estado del producto
          </label>
          <select
            id="estado"
            {...register('estado')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccionar estado</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="fallado">Fallado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_proveedor">
            Proveedor
          </label>
          <select
            id="id_proveedor"
            {...register('id_proveedor')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione un proveedor</option>
            {providers.map((p) => (
              <option key={p.id_proveedor} value={p.id_proveedor}>
                {p.nombre_proveedor}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="precio_compra">
              Precio de compra
            </label>
            <input
              id="precio_compra"
              type="number"
              step="0.01"
              {...register('precio_compra')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="stock">
              Stock inicial
            </label>
            <input
              id="stock"
              type="number"
              {...register('stock')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="fecha_importacion">
              Fecha de importación
            </label>
            <input
              id="fecha_importacion"
              type="date"
              {...register('fecha_importacion')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_almacen">
            Almacén (opcional)
          </label>
          <select
            id="id_almacen"
            {...register('id_almacen')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione un almacén</option>
            {warehouses.map((wh) => (
              <option key={wh.id_almacen} value={wh.id_almacen}>
                {wh.nombre_almacen}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="estado_importacion">
            Estado de importación
          </label>
          <select
            id="estado_importacion"
            {...register('estado_importacion')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccionar estado</option>
            <option value="activa">Activa</option>
            <option value="inactiva">Inactiva</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="imagen">
            Imagen (solo se guardará la ruta)
          </label>
          <input
            id="imagen"
            type="file"
            accept="image/*"
            {...register('imagen')}
            className="w-full"
          />
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </button>
          <Link
            href="/dashboard/productos"
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
