<<<<<<< HEAD
# rey-automotriz
Empresa Rey Automotriz
=======
# Sistema de Gestión Empresarial "Rey Automotriz"

Bienvenido al repositorio del **Sistema de Gestión Empresarial Rey Automotriz (SGERA)**.  Esta aplicación web monolítica ha sido construida con Next.js 14 (App Router) y TypeScript 5, utilizando Prisma como ORM sobre PostgreSQL.  El objetivo del proyecto es centralizar la operación de venta de accesorios electrónicos para autos, automatizando procesos como la gestión de productos, usuarios y clientes, pedidos, devoluciones, finanzas, reportería y notificaciones.  Los requisitos funcionales provienen del documento de requisitos funcionales (FRD) y se han implementado siguiendo fielmente la arquitectura propuesta【250385542692500†L36-L46】【724259443365744†L170-L189】.

## Características clave

- **Autenticación y roles**: Autenticación mediante NextAuth.js y almacenamiento seguro de contraseñas.  Soporta distintos roles (administrador, vendedor, operario) según los definidos en la base de datos.
- **Gestión de productos**: CRUD completo de productos y categorías, con relación a importaciones y stock.  Se implementa un módulo de carga de productos con formularios validados.
- **Gestión de usuarios y clientes**: Alta de usuarios internos y clientes externos con roles asociados.  Los formularios utilizan validaciones con `react-hook-form` y `zod`.
- **Gestión de pedidos y devoluciones**: Creación y seguimiento de pedidos con cálculo automático de totales, comisiones y generación de cuotas para ventas a crédito.  Se pueden registrar devoluciones de productos asociadas a pedidos existentes.
- **Gestión financiera**: Registro de ingresos y egresos con categorías personalizadas, vista de saldos e historial de movimientos.  Incluye CRUD de categorías financieras【250385542692500†L1102-L1237】.
- **Reportería**: Reportes de ventas y créditos con filtros por rango de fechas, vendedor y cliente.  Muestra totales de pedidos, montos pagados y pendientes, así como detalle de cuotas vencidas【250385542692500†L1290-L1354】.
- **Notificaciones**: Panel interno de notificaciones por usuario.  Permite marcar las notificaciones como leídas y mantiene un historial de eventos del sistema【250385542692500†L1356-L1405】.
- **Dashboard ejecutivo**: Página principal con métricas de alto nivel, gráficas interactivas y acceso rápido a los módulos.
- **Diseño corporativo**: La interfaz está diseñada con TailwindCSS siguiendo el Manual de Marca de Rey Automotriz.  Se respeta la paleta de colores, tipografías y estilo visual proporcionados.

## Requisitos previos

Para ejecutar el proyecto necesitas:

1. **Node.js 20 LTS** y **npm 10** o superior.
2. **PostgreSQL 15** o superior.  Debes tener acceso a un servidor de base de datos con privilegios para crear tablas y usuarios.
3. Un entorno donde puedas ejecutar comandos de terminal.

## Configuración y ejecución local

Sigue estos pasos para clonar el repositorio, preparar la base de datos y ejecutar la aplicación en modo de desarrollo:

1. **Clonar el repositorio**

   ```bash
   git clone <URL-del-repositorio> rey-automotriz
   cd rey-automotriz
   ```

2. **Instalar dependencias**

   Ejecuta `npm install` para descargar todas las dependencias listadas en `package.json`.

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Copia el archivo de ejemplo `.env.example` (si existiera) o crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

   ```env
   # Cadena de conexión a PostgreSQL
   # Formato: postgresql://usuario:contraseña@host:puerto/base_de_datos
   DATABASE_URL=postgresql://user:password@localhost:5432/rey_automotriz

   # Dirección base de la aplicación (ej. http://localhost:3000 en desarrollo)
   NEXTAUTH_URL=http://localhost:3000

   # Clave secreta para firmar tokens de NextAuth (genera una cadena aleatoria)
   NEXTAUTH_SECRET=tu_clave_secreta
   ```

   Ajusta los valores según tus credenciales de base de datos.  **No compartas este archivo ni lo subas al control de versiones.**

4. **Preparar la base de datos**

   El archivo SQL `rey_automotriz_claude_db.sql` contiene la estructura inmutable de la base de datos.  Debes ejecutarlo una vez sobre tu servidor PostgreSQL para crear todas las tablas, índices y relaciones.  Puedes hacerlo con la herramienta `psql` o cualquier cliente SQL:

   ```bash
   # Con psql (reemplaza usuario y base de datos)
   psql -U user -d rey_automotriz -f rey_automotriz_claude_db.sql
   ```

   Después de importar el esquema, Prisma se encargará de mapear las tablas existentes mediante el archivo `prisma/schema.prisma`.  No realices migraciones que alteren la estructura definida en el script.

5. **Ejecutar la aplicación en modo desarrollo**

   Con la base de datos configurada y las dependencias instaladas, puedes levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Esto iniciará la aplicación en `http://localhost:3000`.  Abre esa URL en tu navegador y utiliza las credenciales de un usuario existente para iniciar sesión.  Si no tienes usuarios creados, puedes insertar uno manualmente en la tabla `usuarios` con una contraseña hash (consulta el módulo de autenticación en `src/lib/auth.ts` para ver cómo se genera el hash con bcrypt) o crear usuarios desde el módulo de administración.

6. **Probar los endpoints API**

   Todos los endpoints se alojan bajo `/api`.  Puedes utilizar herramientas como Postman o cURL para probar los puntos de entrada de manera independiente.  Por ejemplo:

   - **Listar productos:** `GET /api/products`
   - **Crear pedido:** `POST /api/orders`
   - **Listar movimientos financieros:** `GET /api/finances`
   - **Reporte de ventas:** `GET /api/reports/orders?startDate=2025-01-01&endDate=2025-01-31`

   Los endpoints aceptan y devuelven JSON.  Consulta el código fuente en `src/app/api` para más detalles sobre los parámetros esperados.

## Despliegue en Microsoft Azure

Para desplegar la aplicación en Azure utilizando los servicios recomendados en el documento de arquitectura【724259443365744†L170-L189】, sigue estos pasos de alto nivel:

1. **Crear recursos en Azure**
   - Inicia sesión en [Azure Portal](https://portal.azure.com) y crea un **Resource Group** para agrupar los recursos de producción.
   - Provisiona un **Azure Database for PostgreSQL – Flexible Server**.  Configura el nombre de la base de datos (por ejemplo `rey_automotriz`), usuario administrador y contraseña.  Ajusta el SKU (vCore y almacenamiento) según las necesidades de tu entorno.
   - Crea una cuenta de **Azure Storage (Blob Storage)** si necesitas almacenar imágenes o documentos asociados a movimientos y productos.
   - Crea un **Azure App Service** con el runtime *Node.js 20 LTS*.  Este servicio hospedará la aplicación Next.js.

2. **Configurar la base de datos en Azure**
   - Habilita el acceso público o configura redes virtuales según tu estrategia de seguridad.
   - Carga el archivo `rey_automotriz_claude_db.sql` en tu servidor PostgreSQL de Azure utilizando `pgAdmin`, `psql` o el portal web.
   - Actualiza el parámetro `DATABASE_URL` en la configuración de la aplicación (Paso 4 siguiente) para que apunte a tu servidor de Azure.

3. **Preparar el código para despliegue**
   - Asegúrate de que todas las dependencias estén instaladas (`npm install`) y que la aplicación compile correctamente (`npm run build`).
   - Genera un archivo comprimido (por ejemplo `zip`) con el contenido del directorio `rey-automotriz`, excluyendo el directorio `node_modules` si vas a utilizar la opción de instalación automática de dependencias de App Service.

4. **Configurar variables de entorno en App Service**
   - En el recurso de **App Service**, ve a **Configuration → Application Settings** y agrega las variables necesarias:
     - `DATABASE_URL` con la cadena de conexión del PostgreSQL de Azure.
     - `NEXTAUTH_URL` con la URL pública de la aplicación (p. ej., `https://misger.azurewebsites.net`).
     - `NEXTAUTH_SECRET` con una cadena secreta generada aleatoriamente.
     - Cualquier otra variable que uses para servicios externos (por ejemplo SendGrid, Twilio, etc.).

5. **Desplegar la aplicación**
   - Puedes usar la funcionalidad de **Deployment Center** de App Service para configurar despliegues automáticos desde GitHub.  Selecciona el repositorio y la rama principal, y App Service ejecutará `npm install` y `npm run build` automáticamente.
   - Alternativamente, sube el paquete ZIP a través de **Zip Deploy** o utiliza la extensión de VS Code para Azure App Service.

6. **Configurar dominios y HTTPS**
   - Configura un dominio personalizado si lo necesitas y habilita HTTPS a través de los certificados integrados de App Service o sube tus propios certificados.

7. **Supervisión y escalado**
   - Habilita **Application Insights** en tu App Service para obtener métricas y trazas de la aplicación.
   - Considera activar **Autoscale** o ajustar manualmente el plan de App Service para manejar picos de tráfico.

## Consideraciones finales

- Este repositorio sigue las buenas prácticas recomendadas: el código está escrito en TypeScript estricto, se utiliza Prisma para el acceso a datos, Tailwind CSS para el diseño y NextAuth para la autenticación.
- Los endpoints están pensados para ser probados en aislamiento y retornar códigos de estado HTTP adecuados.  Se han incluido mensajes de error descriptivos y control de errores.
- Para más detalles sobre la lógica de negocio y las reglas implementadas, consulta el FRD original y el código fuente en la carpeta `src/app/api`.

¡Gracias por utilizar el Sistema Rey Automotriz!  Si encuentras algún problema o tienes sugerencias, no dudes en crear un issue o enviar un pull request.
>>>>>>> 3568cc3 (repo sistema automotriz)
