"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const userSchema = z.object({
  correo_electronico: z.string().email({ message: 'Correo inválido' }),
  nombre_completo: z.string().min(3, { message: 'El nombre es requerido' }),
  contrasena: z.string().min(6, { message: 'Mínimo 6 caracteres' }),
  id_rol: z.string().min(1, { message: 'Seleccione un rol' }),
});
type UserForm = z.infer<typeof userSchema>;

export default function NuevoUsuarioPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({ resolver: zodResolver(userSchema) });

  useEffect(() => {
    async function loadRoles() {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data);
      }
    }
    loadRoles();
  }, []);

  const onSubmit = async (data: UserForm) => {
    setErrorMessage(null);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        correo_electronico: data.correo_electronico.toLowerCase(),
        nombre_completo: data.nombre_completo,
        contrasena: data.contrasena,
        id_rol: parseInt(data.id_rol, 10),
      }),
    });
    if (res.ok) {
      router.push('/dashboard/usuarios');
    } else {
      const err = await res.json();
      setErrorMessage(err.error || 'Error al guardar');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-primary">Nuevo Usuario</h2>
      {errorMessage && (
        <div className="p-2 bg-secondary text-white rounded-md text-sm">{errorMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded-lg shadow">
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
          <label className="block text-sm font-medium mb-1" htmlFor="nombre_completo">
            Nombre completo
          </label>
          <input
            id="nombre_completo"
            type="text"
            {...register('nombre_completo')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.nombre_completo && (
            <p className="mt-1 text-xs text-secondary">{errors.nombre_completo.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="contrasena">
            Contraseña
          </label>
          <input
            id="contrasena"
            type="password"
            {...register('contrasena')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          />
          {errors.contrasena && (
            <p className="mt-1 text-xs text-secondary">{errors.contrasena.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="id_rol">
            Rol
          </label>
          <select
            id="id_rol"
            {...register('id_rol')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-light"
          >
            <option value="">Seleccione un rol</option>
            {roles.map((role) => (
              <option key={role.id_rol} value={role.id_rol}>
                {role.nombre_rol}
              </option>
            ))}
          </select>
          {errors.id_rol && (
            <p className="mt-1 text-xs text-secondary">{errors.id_rol.message}</p>
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
            href="/dashboard/usuarios"
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded-md"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}