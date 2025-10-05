"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const productSchema = z.object({
  codigo_producto: z.string().min(1, { message: 'Requerido' }),
  descripcion: z.string().min(1, { message: 'Requerido' }),
  id_categoria: z.string().min(1, { message: 'Requerido' }),
});
type ProductForm = z.infer<typeof productSchema>;

export default function NuevoProductoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  useEffect(() => {
    async function loadCategories() {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats);
      }
    }
    loadCategories();
  }, []);

  const onSubmit = async (data: ProductForm) => {
    setErrorMessage(null);
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_producto: data.codigo_producto,
        descripcion: data.descripcion,
        id_categoria: parseInt(data.id_categoria, 10),
      }),
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