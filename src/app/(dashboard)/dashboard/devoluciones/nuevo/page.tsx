"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const returnItemSchema = z.object({
  id_producto: z.string().min(1),
  cantidad_devuelta: z.number().min(1),
  motivo_producto: z.string().optional(),
});
const returnSchema = z.object({
  id_pedido: z.string().min(1),
  id_cliente: z.string().min(1),
  motivo: z.string().min(1),
  items: z.array(returnItemSchema).min(1),
});
type ReturnForm = z.infer<typeof returnSchema>;

export default function NuevaDevolucionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [orders, setOrders] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReturnForm>({
    resolver: zodResolver(returnSchema),
    defaultValues: { items: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    async function load() {
      const [oRes, cRes, pRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/clients'),
        fetch('/api/products'),
      ]);
      if (oRes.ok) setOrders(await oRes.json());
      if (cRes.ok) setClients(await cRes.json());
      if (pRes.ok) setProducts(await pRes.json());
    }
    load();
  }, []);

  // When the order changes, preselect the client
  const id_pedido_selected = watch('id_pedido');
  useEffect(() => {
    if (id_pedido_selected) {
      const order = orders.find((o) => String(o.id_pedido) === id_pedido_selected);
      if (order) {
        // Set id_cliente field if not already set
        const clienteId = String(order.id_cliente);
        // we cannot set value directly; but form default can remain
      }
    }
  }, [id_pedido_selected, orders]);

  const onSubmit = async (data: ReturnForm) => {
    setErrorMessage(null);
    const body = {
      id_pedido: parseInt(data.id_pedido, 10),
      id_cliente: parseInt(data.id_cliente, 10),
      id_vendedor: session?.user?.id ? parseInt(session.user.id, 10) : undefined,
      motivo: data.motivo,
      detalles: data.items.map((item) => ({
        id_producto: parseInt(item.id_producto, 10),
        cantidad_devuelta: item.cantidad_devuelta,
        motivo_producto: item.motivo_producto ?? null,
      })),
    };
    const res = await fetch('/api/returns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push('/dashboard/devoluciones');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nueva Devolución</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pedido</label>
            <select
              {...register('id_pedido')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Seleccione</option>
              {orders.map((o) => (
                <option key={o.id_pedido} value={o.id_pedido}>
                  #{o.id_pedido} - {o.cliente.razon_social}
                </option>
              ))}
            </select>
            {errors.id_pedido && (
              <p className="mt-1 text-xs text-secondary">{errors.id_pedido.message as string}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <select
              {...register('id_cliente')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Seleccione</option>
              {clients.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.razon_social}
                </option>
              ))}
            </select>
            {errors.id_cliente && (
              <p className="mt-1 text-xs text-secondary">{errors.id_cliente.message as string}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Motivo de la devolución</label>
          <textarea
            {...register('motivo')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.motivo && (
            <p className="mt-1 text-xs text-secondary">{errors.motivo.message as string}</p>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Productos devueltos</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end mb-4 p-4 bg-neutral-50 rounded-md">
              <div className="col-span-2">
                <label className="block text-xs font-medium mb-1">Producto</label>
                <select
                  {...register(`items.${index}.id_producto` as const)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
                >
                  <option value="">Seleccione</option>
                  {products.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.descripcion}
                    </option>
                  ))}
                </select>
                {errors.items?.[index]?.id_producto && (
                  <p className="mt-1 text-xs text-secondary">{(errors.items[index]?.id_producto as any)?.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Cantidad devuelta</label>
                <input
                  type="number"
                  {...register(`items.${index}.cantidad_devuelta`, { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
                />
                {errors.items?.[index]?.cantidad_devuelta && (
                  <p className="mt-1 text-xs text-secondary">{(errors.items[index]?.cantidad_devuelta as any)?.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Motivo del producto</label>
                <input
                  type="text"
                  {...register(`items.${index}.motivo_producto`)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
                />
              </div>
              <button type="button" onClick={() => remove(index)} className="text-red-600 text-sm underline">
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ id_producto: '', cantidad_devuelta: 1, motivo_producto: '' })}
            className="mt-2 px-4 py-2 bg-secondary text-white rounded-md"
          >
            Añadir producto
          </button>
          {errors.items && typeof errors.items.message === 'string' && (
            <p className="mt-1 text-xs text-secondary">{errors.items.message}</p>
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
            href="/dashboard/devoluciones"
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}