"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Esquema de validación para el formulario de clientes.
const clientSchema = z.object({
  id_vendedor_asignado: z.string().min(1, { message: 'Requerido' }),
  razon_social: z.string().min(1, { message: 'Requerido' }),
  ruc: z.string().optional(),
  nombre_representante: z.string().optional(),
  cumpleanos_representante: z.string().optional(),
  correo_electronico: z.string().email({ message: 'Correo inválido' }),
  telefono_principal: z.string().optional(),
  telefono_secundario: z.string().optional(),
  dni_representante: z.string().optional(),
  tipo_cliente: z.string().optional(),
  departamento: z.string().optional(),
  provincia: z.string().optional(),
  distrito: z.string().optional(),
  direccion: z.string().optional(),
});

type ClientForm = z.infer<typeof clientSchema>;

export default function NuevoClientePage() {
  const router = useRouter();
  const [vendedores, setVendedores] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientForm>({ resolver: zodResolver(clientSchema) });

  useEffect(() => {
    async function loadVendedores() {
      const res = await fetch('/api/users');
      if (res.ok) {
        const users = await res.json();
        // Filtrar solo vendedores. Asumimos que el rol tiene nombre 'Vendedor'.
        const vend = users.filter((u: any) => u.rol?.nombre_rol?.toLowerCase() === 'vendedor');
        setVendedores(vend);
      }
    }
    loadVendedores();
  }, []);

  const onSubmit = async (data: ClientForm) => {
    setErrorMessage(null);
    // Convert id_vendedor_asignado to integer
    const payload = { ...data, id_vendedor_asignado: parseInt(data.id_vendedor_asignado, 10) };
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/dashboard/clientes');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al guardar cliente');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nuevo Cliente</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="razon_social">
            Razón social
          </label>
          <input
            id="razon_social"
            type="text"
            {...register('razon_social')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.razon_social && (
            <p className="mt-1 text-xs text-secondary">{errors.razon_social.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="ruc">
            RUC
          </label>
          <input
            id="ruc"
            type="text"
            {...register('ruc')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="correo_electronico">
            Correo electrónico
          </label>
          <input
            id="correo_electronico"
            type="email"
            {...register('correo_electronico')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.correo_electronico && (
            <p className="mt-1 text-xs text-secondary">{errors.correo_electronico.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="telefono_principal">
            Teléfono principal
          </label>
          <input
            id="telefono_principal"
            type="text"
            {...register('telefono_principal')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="telefono_secundario">
            Teléfono secundario
          </label>
          <input
            id="telefono_secundario"
            type="text"
            {...register('telefono_secundario')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="nombre_representante">
            Nombre del representante
          </label>
          <input
            id="nombre_representante"
            type="text"
            {...register('nombre_representante')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="dni_representante">
            DNI del representante
          </label>
          <input
            id="dni_representante"
            type="text"
            {...register('dni_representante')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="cumpleanos_representante">
            Cumpleaños del representante
          </label>
          <input
            id="cumpleanos_representante"
            type="date"
            {...register('cumpleanos_representante')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="tipo_cliente">
            Tipo de cliente
          </label>
          <select
            id="tipo_cliente"
            {...register('tipo_cliente')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione…</option>
            <option value="regular">Regular</option>
            <option value="vip">VIP</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="departamento">
            Departamento
          </label>
          <input
            id="departamento"
            type="text"
            {...register('departamento')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="provincia">
            Provincia
          </label>
          <input
            id="provincia"
            type="text"
            {...register('provincia')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="distrito">
            Distrito
          </label>
          <input
            id="distrito"
            type="text"
            {...register('distrito')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="direccion">
            Dirección
          </label>
          <textarea
            id="direccion"
            {...register('direccion')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_vendedor_asignado">
            Vendedor asignado
          </label>
          <select
            id="id_vendedor_asignado"
            {...register('id_vendedor_asignado')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione un vendedor</option>
            {vendedores.map((v) => (
              <option key={v.id_usuario} value={v.id_usuario}>
                {v.nombre_completo}
              </option>
            ))}
          </select>
          {errors.id_vendedor_asignado && (
            <p className="mt-1 text-xs text-secondary">{errors.id_vendedor_asignado.message}</p>
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
            href="/dashboard/clientes"
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}