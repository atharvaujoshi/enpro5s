
import { MongoClient } from 'mongodb'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Jimp } from 'jimp'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'
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
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    
    // Add text at bottom left
    image.print(font, 20, image.getHeight() - 50, text)
    
    return await image.getBufferAsync(Jimp.MIME_JPEG)
  } catch (error) {
    console.error('Watermark error:', error)
    return buffer // Return original if fails
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
    const workId = formData.get('workId') || uuidv4() // Use provided or generate new

    // Role Validation: Managers cannot upload 'before' photos
    if (photoType === 'before' && session.user.role === 'zone_manager') {
      return Response.json({ error: 'Zone Managers are only allowed to upload After photos.' }, { status: 403 })
    }

    // Validation
    if (!photo || !zoneId || !photoType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (photo.size > 10 * 1024 * 1024) { // 10MB limit
      return Response.json({ error: 'File size must be less than 10MB' }, { status: 400 })
    }

    if (!photo.type.startsWith('image/')) {
      return Response.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Create uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Ignore if exists
    }

    // Generate unique filename
    const fileExtension = photo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `zone-${zoneId}-${workType}-${photoType}-${Date.now()}-${uuidv4()}.${fileExtension}`
    const filepath = path.join(uploadsDir, filename)

    // Process Image (Watermark)
    let bytes = await photo.arrayBuffer()
    let buffer = Buffer.from(bytes)
    
    // Watermark with Work ID / Serial Number
    const serialNumber = `ID: ${workId.slice(-8).toUpperCase()}`
    buffer = await addWatermark(buffer, serialNumber)

    // Save file
    await writeFile(filepath, buffer)

    // Prepare photo data
    const photoData = {
      _id: uuidv4(),
      url: `/uploads/${filename}`,
      filename: filename,
      originalName: photo.name,
      timestamp: new Date(),
      size: photo.size,
      type: photo.type
    }

    // Database Operation
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    if (photoType === 'before') {
      // Calculate Deadline
      let deadline = new Date()
      if (workType === 'FPP') {
        deadline.setDate(deadline.getDate() + 90) // 90 days
      } else if (workType === 'WPP') {
        deadline.setHours(deadline.getHours() + 48) // 48 hours
      } else {
        deadline.setDate(deadline.getDate() + 7) // Default 7 days
      }

      // Check if we are appending to an existing work record (if workId was passed for a 'before' photo)
      // The frontend logic for 'before' currently implies creating NEW records.
      // But if we want to allow "Add more photos" to FPP, we might need to handle appending.
      // For now, assume 'before' creates new, unless we implement specific "Add to existing" logic.
      // Based on prompt: "FPP tab total 6 photo uploads... option to add more".
      // This implies we might want to append to an OPEN FPP record.
      
      // Let's check if there is an open (inprogress) FPP record for this zone to append to?
      // Or simply create new ones. The prompt says "total 6 photo uploads are required".
      // Simpler approach: Create the record. The UI can group them or we can append if frontend sends workId.
      
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

      // Trigger notification for 'before' upload
      try {
        const zone = await db.collection('zones').findOne({ id: zoneId }, { projection: { name: 1 } })
        const managerEmail = await getManagerEmailForZone(zoneId);
        await sendUploadNotification(zone?.name || `Zone ${zoneId}`, 'before', workId, managerEmail)
      } catch (notifyError) {
        console.error('Notification error (non-blocking):', notifyError)
      }
    } else if (photoType === 'after') {
      const targetWorkId = formData.get('workId') // Must exist for after
      if (!targetWorkId) {
        await client.close()
        return Response.json({ error: 'Work ID is required for after photos' }, { status: 400 })
      }

      // Logic for WPP: Archive old after photos if they exist
      if (workType === 'WPP') {
        // We need to fetch the record first to get existing after photos
        const zone = await db.collection('zones').findOne(
          { id: zoneId, "workRecords._id": targetWorkId },
          { projection: { "workRecords.$": 1 } }
        )
        
        const workRecord = zone?.workRecords?.[0]
        
        if (workRecord && workRecord.afterPhotos && workRecord.afterPhotos.length > 0) {
          // Move existing after photos to archive
          await db.collection('zones').updateOne(
            { id: zoneId, "workRecords._id": targetWorkId },
            { 
              $push: { "workRecords.$.archivedPhotos": { $each: workRecord.afterPhotos } },
              $set: { "workRecords.$.afterPhotos": [] } // Clear current
            }
          )
        }
      }

      // Add new photo
      const result = await db.collection('zones').updateOne(
        { id: zoneId, "workRecords._id": targetWorkId },
        { 
          $push: { "workRecords.$.afterPhotos": photoData },
          $set: { 
            "workRecords.$.updatedAt": new Date(),
            updatedAt: new Date()
          }
        }
      )

      if (result.matchedCount === 0) {
        await client.close()
        return Response.json({ error: 'Work record not found' }, { status: 404 })
      }

      // Trigger email notification if documentation is complete
      try {
        const updatedZone = await db.collection('zones').findOne(
          { id: zoneId, "workRecords._id": targetWorkId },
          { projection: { name: 1, "workRecords.$": 1 } }
        )
        if (updatedZone && updatedZone.workRecords?.[0]) {
          const zoneName = updatedZone.name || `Zone ${zoneId}`;
          const ceoEmail = getCEOEmail();
          // Send notification that 'after' photo was uploaded
          await sendUploadNotification(zoneName, 'after', targetWorkId, ceoEmail);
          // Send summary notification for completion
          await sendCompletionNotification(zoneName, updatedZone.workRecords[0], ceoEmail);
        }
      } catch (notifyError) {
        console.error('Notification error (non-blocking):', notifyError)
      }
    }

    await client.close()

    return Response.json({ 
      success: true, 
      message: 'Photo uploaded successfully',
      photo: photoData
    })

  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed: ' + error.message }, { status: 500 })
  }
}
