
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(request, { params }) {
  const { filename } = params
  
  const isServerless = process.env.VERCEL === '1'
  const uploadsDir = isServerless 
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'public', 'uploads')
    
  const filepath = path.join(uploadsDir, filename)

  try {
    const fileBuffer = await readFile(filepath)
    const ext = path.extname(filename).toLowerCase()
    
    let contentType = 'image/jpeg'
    if (ext === '.png') contentType = 'image/png'
    if (ext === '.gif') contentType = 'image/gif'
    if (ext === '.webp') contentType = 'image/webp'

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    return new Response('Photo not found', { status: 404 })
  }
}
