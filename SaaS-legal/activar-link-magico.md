# Magic Link — Acceso Público Temporal

## ¿Qué se deshabilitó?

En el archivo `src/middleware.ts` se comentaron las líneas que bloquean el acceso a usuarios no autenticados.

**Líneas comentadas (24-26):**
```ts
// if (!isLoggedIn && !isPublicRoute) {
//   return NextResponse.redirect(new URL("/login", req.nextUrl));
// }
```

Esto hace que cualquier persona pueda entrar al SaaS directamente con solo abrir la URL, sin necesidad de recibir ningún correo ni hacer login.

Nada más fue modificado: la lógica de auth, la base de datos, los emails y todos los componentes permanecen intactos.

---

## ¿Cómo reactivar el magic link?

1. Abre el archivo `src/middleware.ts`
2. Ve a las líneas 24-26
3. Descomenta el bloque (quita los `//`):

```ts
if (!isLoggedIn && !isPublicRoute) {
  return NextResponse.redirect(new URL("/login", req.nextUrl));
}
```

4. Guarda el archivo — el servidor lo recarga automáticamente.

A partir de ese momento, cualquier usuario que intente acceder sin sesión será redirigido a `/login` y deberá ingresar su email para recibir el magic link.
