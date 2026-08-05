# Instrucciones para configurar el proyecto

## Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Cuenta en [Supabase](https://supabase.com) (gratuita)
- Cuenta en [Resend](https://resend.com) (gratuita)
- Cuenta en [Neon](https://neon.tech) o cualquier PostgreSQL (gratuita)

---

## Pasos para levantar el proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y renómbralo:

```bash
cp .env.local.example .env.local
```

Abre `.env.local` y llena cada variable con tus propias credenciales:

```env
DATABASE_URL=        # Connection string de tu base de datos PostgreSQL
AUTH_SECRET=         # Cualquier string largo y aleatorio (mínimo 32 caracteres)
AUTH_RESEND_KEY=     # API key de tu cuenta en resend.com
NEXT_PUBLIC_APP_URL= # http://localhost:3000 (para desarrollo local)
```

> Para generar un `AUTH_SECRET` seguro puedes usar:
> ```bash
> openssl rand -base64 32
> ```

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## Notas importantes

- **No compartas tu `.env.local`** con nadie ni lo subas a ningún repositorio.
- La carpeta `node_modules/` no viene incluida — se genera con `npm install`.
- La carpeta `.next/` tampoco viene — se genera al correr `npm run dev`.
- Cada integrante debe tener sus **propias credenciales** en su `.env.local`.

---

## Comandos útiles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Build de producción
npm run typecheck  # Verificar tipos TypeScript
npm run lint       # Revisar errores de estilo
```
