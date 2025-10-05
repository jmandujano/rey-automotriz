"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

interface CategoriaFinanciera {
  id_categoria_financiera: number;
  nombre_categoria: string;
  tipo_categoria: string;
  descripcion?: string | null;
}

/**
 * Página para gestionar categorías financieras (ingresos y egresos).  Permite
 * listar todas las categorías existentes, crear nuevas, actualizar nombre y
 * eliminar aquellas que no tengan movimientos asociados.  Cumple con el
 * requisito 5.5 del FRD【250385542692500†L1255-L1235】.
 */
export default function CategoriasFinancierasPage() {
  const { data: categories, mutate } = useSWR<CategoriaFinanciera[]>(
    '/api/finances/categories',
    fetcher,
  );
  const [form, setForm] = useState({
    nombre_categoria: '',
    tipo_categoria: 'ingreso',
    descripcion: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await fetch('/api/finances/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      mutate();
      setForm({ nombre_categoria: '', tipo_categoria: 'ingreso', descripcion: '' });
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdate(id: number) {
    if (!editName) return;
    try {
      await fetch(`/api/finances/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_categoria: editName }),
      });
      setEditingId(null);
      setEditName('');
      mutate();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      const res = await fetch(`/api/finances/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error || 'No se pudo eliminar');
      } else {
        mutate();
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800">
        Categorías Financieras
      </h2>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">Nueva Categoría</h3>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="nombre_categoria"
              value={form.nombre_categoria}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              name="tipo_categoria"
              value={form.tipo_categoria}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="ingreso">Ingreso</option>
              <option value="egreso">Egreso</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2"
              rows={2}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-600 mb-4">Lista de Categorías</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Tipo
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories?.map((c) => (
                <tr key={c.id_categoria_financiera} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {c.id_categoria_financiera}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {editingId === c.id_categoria_financiera ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border rounded-md px-2 py-1"
                      />
                    ) : (
                      c.nombre_categoria
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 capitalize">
                    {c.tipo_categoria}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700 space-x-2">
                    {editingId === c.id_categoria_financiera ? (
                      <>
                        <button
                          className="text-primary hover:underline"
                          onClick={() => handleUpdate(c.id_categoria_financiera)}
                        >
                          Guardar
                        </button>
                        <button
                          className="text-gray-500 hover:underline"
                          onClick={() => {
                            setEditingId(null);
                            setEditName('');
                          }}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-primary hover:underline"
                          onClick={() => {
                            setEditingId(c.id_categoria_financiera);
                            setEditName(c.nombre_categoria);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => handleDelete(c.id_categoria_financiera)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories?.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">No hay categorías registradas.</p>
          )}
        </div>
      </div>
    </div>
  );
}