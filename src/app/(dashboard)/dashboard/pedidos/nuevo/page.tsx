"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const itemSchema = z.object({
  id_producto: z.string().min(1),
  cantidad: z.number().min(1),
  precio_unitario: z.number().min(0),
});
const orderSchema = z.object({
  id_cliente: z.string().min(1),
  items: z.array(itemSchema).min(1),
  tipo_pago: z.string().min(1),
  tipo_comprobante: z.string().min(1),
  observaciones: z.string().optional(),
});
type OrderForm = z.infer<typeof orderSchema>;

export default function NuevoPedidoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [clients, setClients] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { items: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  useEffect(() => {
    async function load() {
      const [cRes, pRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/products'),
      ]);
      if (cRes.ok) setClients(await cRes.json());
      if (pRes.ok) setProducts(await pRes.json());
    }
    load();
  }, []);

  const onSubmit = async (data: OrderForm) => {
    setErrorMessage(null);
    const body = {
      id_cliente: parseInt(data.id_cliente, 10),
      id_vendedor: session?.user?.id ? parseInt(session.user.id, 10) : undefined,
      tipo_pago: data.tipo_pago,
      tipo_comprobante: data.tipo_comprobante,
      observaciones: data.observaciones,
      items: data.items.map((item) => ({
        id_producto: parseInt(item.id_producto, 10),
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      })),
    };
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      router.push('/dashboard/pedidos');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nuevo Pedido</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_cliente">
            Cliente
          </label>
          <select
            id="id_cliente"
            {...register('id_cliente')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione un cliente</option>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="tipo_pago">
              Tipo de pago
            </label>
            <select
              id="tipo_pago"
              {...register('tipo_pago')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Seleccione</option>
              <option value="contado">Contado</option>
              <option value="credito">Crédito</option>
            </select>
            {errors.tipo_pago && (
              <p className="mt-1 text-xs text-secondary">{errors.tipo_pago.message as string}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="tipo_comprobante">
              Tipo de comprobante
            </label>
            <select
              id="tipo_comprobante"
              {...register('tipo_comprobante')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
            >
              <option value="">Seleccione</option>
              <option value="boleta">Boleta</option>
              <option value="factura">Factura</option>
              <option value="guia">Guía</option>
            </select>
            {errors.tipo_comprobante && (
              <p className="mt-1 text-xs text-secondary">{errors.tipo_comprobante.message as string}</p>
            )}
          </div>
        </div>
        {/* Items */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Productos</h3>
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
                <label className="block text-xs font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
                />
                {errors.items?.[index]?.cantidad && (
                  <p className="mt-1 text-xs text-secondary">{(errors.items[index]?.cantidad as any)?.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  {...register(`items.${index}.precio_unitario`, { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
                />
                {errors.items?.[index]?.precio_unitario && (
                  <p className="mt-1 text-xs text-secondary">{(errors.items[index]?.precio_unitario as any)?.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-600 text-sm underline"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ id_producto: '', cantidad: 1, precio_unitario: 0 })}
            className="mt-2 px-4 py-2 bg-secondary text-white rounded-md"
          >
            Añadir producto
          </button>
          {errors.items && typeof errors.items.message === 'string' && (
            <p className="mt-1 text-xs text-secondary">{errors.items.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="observaciones">
            Observaciones
          </label>
          <textarea
            id="observaciones"
            {...register('observaciones')}
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
            href="/dashboard/pedidos"
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}