import { NextResponse } from 'next/server';
import { loginUsuario } from '../../actions';

export async function GET() {
  try {
    const user = await loginUsuario('admin@cmds.cl', 'admin');
    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}
