import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export function GET() {
  const pdf = readFileSync(join(process.cwd(), 'app/_features/userena/footer/assets/ULS-INST-00053-05-RESD-3.pdf'))

  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="ULS-INST-00053-05-RESD-3.pdf"',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}
