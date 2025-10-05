"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Esquema de validación para categorías de productos
const categorySchema = z.object({
  nombre_categoria: z.string().min(1, { message: 'Requerido' }),
  porcentaje_alerta_stock: z.coerce.number().min(0).max(100).optional(),
  id_categoria_padre: z.string().optional(),
  descripcion: z.string().optional(),
});
type CategoryForm = z.infer<typeof categorySchema>;

export default function NuevaCategoriaProductoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({ resolver: zodResolver(categorySchema) });

  useEffect(() => {
    async function loadCats() {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const cats = await res.json();
        setCategories(cats);
      }
    }
    loadCats();
  }, []);

  const onSubmit = async (data: CategoryForm) => {
    setErrorMessage(null);
    // Convert numeric fields and optional parent ID
    const body: any = {
      nombre_categoria: data.nombre_categoria,
      porcentaje_alerta_stock: data.porcentaje_alerta_stock ?? undefined,
      descripcion: data.descripcion ?? undefined,
    };
    if (data.id_categoria_padre) {
      body.id_categoria_padre = parseInt(data.id_categoria_padre, 10);
    }
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push('/dashboard/productos');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al crear la categoría');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nueva Categoría de Producto</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nombre_categoria">
            Nombre de la categoría
          </label>
          <input
            id="nombre_categoria"
            type="text"
            {...register('nombre_categoria')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.nombre_categoria && (
            <p className="mt-1 text-xs text-secondary">{errors.nombre_categoria.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="porcentaje_alerta_stock">
            Porcentaje de alerta de stock (%)
          </label>
          <input
            id="porcentaje_alerta_stock"
            type="number"
            step="0.01"
            {...register('porcentaje_alerta_stock')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.porcentaje_alerta_stock && (
            <p className="mt-1 text-xs text-secondary">{errors.porcentaje_alerta_stock.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_categoria_padre">
            Categoría padre (opcional)
          </label>
          <select
            id="id_categoria_padre"
            {...register('id_categoria_padre')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Ninguna</option>
            {categories.map((cat) => (
              <option key={cat.id_categoria} value={cat.id_categoria}>
                {cat.nombre_categoria}
              </option>
            ))}
          </select>
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