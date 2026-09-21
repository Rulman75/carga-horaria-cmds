import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // Permitir acceso a la ruta de login y rutas estáticas
  if (pathname === '/login' || pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.endsWith('.ico')) {
    // Si ya está logueado y va a /login, redirigir al inicio
    if (pathname === '/login' && token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/', req.url));
      } catch (e) {
        // Token inválido, dejarlo en login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Rutas protegidas: redirigir a /login si no hay token
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'cmds2026_super_secret_key');
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    // Token inválido o expirado
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    return response;
  }
}

// Configurar el middleware para que intercepte todas las páginas excepto los recursos estáticos puros
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
