
import { MongoClient } from 'mongodb'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Jimp, loadFont } from 'jimp'
import { FONT_SANS_32_WHITE } from 'jimp/fonts'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
import { put } from '@vercel/blob'
import { 
  sendUploadNotification, 
  sendCompletionNotification, 
  getCEOEmail
} from '../../../lib/notifications'
import { getManagerEmailForZone } from '../../../lib/users'

const uri = process.env.MONGODB_URI

// Helper to add watermark
async function addWatermark(buffer, text) {
  try {
    const image = await Jimp.read(buffer)
    const font = await loadFont(FONT_SANS_32_WHITE)
    
    image.print({
      font,
      x: 20,
      y: image.height - 50,
      text
    })
    
    return await image.getBuffer('image/jpeg')
  } catch (error) {
    console.error('Watermark error:', error)
    return buffer
  }
}

export async function POST(request) {
  try {
    if (!uri) {
      return Response.json({ error: 'Database connection not configured' }, { status: 500 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const photo = formData.get('photo')
    const zoneId = parseInt(formData.get('zoneId'))
    const photoType = formData.get('photoType')
    const workType = formData.get('workType') || 'WPP'
    const workId = formData.get('workId') || uuidv4()

    if (photoType === 'before' && session.user.role === 'zone_manager') {
      return Response.json({ error: 'Zone Managers are only allowed to upload After photos.' }, { status: 403 })
    }

    if (photoType === 'after' && session.user.role === 'user') {
      return Response.json({ error: 'Standard Users are only allowed to upload Before photos.' }, { status: 403 })
    }

    if (!photo || !zoneId || !photoType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Process Image (Watermark)
    let bytes = await photo.arrayBuffer()
    let buffer = Buffer.from(bytes)
    const serialNumber = `ID: ${workId.slice(-8).toUpperCase()}`
    const watermarkedBuffer = await addWatermark(buffer, serialNumber)

    const isServerless = process.env.VERCEL === '1'
    let finalUrl = ''
    let finalFilename = ''

    if (isServerless) {
      // PERMANENT STORAGE: Vercel Blob
      const blobFilename = `zone-${zoneId}-${workType}-${photoType}-${Date.now()}-${uuidv4()}.jpg`
      const blob = await put(blobFilename, watermarkedBuffer, {
        access: 'public',
      })
      finalUrl = blob.url
      finalFilename = blobFilename
    } else {
      // LOCAL STORAGE: public/uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      await mkdir(uploadsDir, { recursive: true })
      
      finalFilename = `zone-${zoneId}-${workType}-${photoType}-${Date.now()}-${uuidv4()}.jpg`
      const filepath = path.join(uploadsDir, finalFilename)
      await writeFile(filepath, watermarkedBuffer)
      finalUrl = `/uploads/${finalFilename}`
    }

    const photoData = {
      _id: uuidv4(),
      url: finalUrl,
      filename: finalFilename,
      originalName: photo.name,
      timestamp: new Date(),
      size: photo.size,
      type: photo.type
    }

    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    if (photoType === 'before') {
      let deadline = new Date()
      if (workType === 'FPP') {
        deadline.setDate(deadline.getDate() + 90)
      } else if (workType === 'WPP') {
        deadline.setHours(deadline.getHours() + 48)
      } else {
        deadline.setDate(deadline.getDate() + 7)
      }

      const newWorkRecord = {
        _id: workId,
        workType: workType,
        status: 'inprogress',
        beforePhotos: [photoData],
        afterPhotos: [],
        archivedPhotos: [],
        deadline: deadline,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await db.collection('zones').updateOne(
        { id: zoneId },
        { 
          $push: { workRecords: newWorkRecord },
          $set: { updatedAt: new Date() }
        }
      )

      try {
        const zone = await db.collection('zones').findOne({ id: zoneId }, { projection: { name: 1 } })
        const managerEmail = await getManagerEmailForZone(zoneId);
        await sendUploadNotification(zone?.name || `Zone ${zoneId}`, 'before', workId, managerEmail)
      } catch (notifyError) {
        console.error('Notification error:', notifyError)
      }
    } else if (photoType === 'after') {
      const targetWorkId = formData.get('workId')
      if (!targetWorkId) {
        await client.close()
        return Response.json({ error: 'Work ID is required' }, { status: 400 })
      }

      if (workType === 'WPP') {
        const zone = await db.collection('zones').findOne(
          { id: zoneId, "workRecords._id": targetWorkId },
          { projection: { "workRecords.$": 1 } }
        )
        const workRecord = zone?.workRecords?.[0]
        if (workRecord?.afterPhotos?.length > 0) {
          await db.collection('zones').updateOne(
            { id: zoneId, "workRecords._id": targetWorkId },
            { 
              $push: { "workRecords.$.archivedPhotos": { $each: workRecord.afterPhotos } },
              $set: { "workRecords.$.afterPhotos": [] }
            }
          )
        }
      }

      const result = await db.collection('zones').updateOne(
        { id: zoneId, "workRecords._id": targetWorkId },
        { 
          $push: { "workRecords.$.afterPhotos": photoData },
          $set: { "workRecords.$.updatedAt": new Date(), updatedAt: new Date() }
        }
      )

      if (result.matchedCount === 0) {
        await client.close()
        return Response.json({ error: 'Work record not found' }, { status: 404 })
      }

      try {
        const updatedZone = await db.collection('zones').findOne(
          { id: zoneId, "workRecords._id": targetWorkId },
          { projection: { name: 1, "workRecords.$": 1 } }
        )
        if (updatedZone && updatedZone.workRecords?.[0]) {
          const zoneName = updatedZone.name || `Zone ${zoneId}`;
          const ceoEmail = getCEOEmail();
          await sendUploadNotification(zoneName, 'after', targetWorkId, ceoEmail);
          await sendCompletionNotification(zoneName, updatedZone.workRecords[0], ceoEmail);
        }
      } catch (notifyError) {
        console.error('Notification error:', notifyError)
      }
    }

    await client.close()
    return Response.json({ success: true, photo: photoData })

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }
}
