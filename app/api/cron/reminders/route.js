
import { MongoClient } from 'mongodb'
import nodemailer from 'nodemailer'

const uri = process.env.MONGODB_URI

export async function GET() {
  try {
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db()

    // Find active work records approaching deadline
    // FPP: 1 week before (7 days)
    // WPP: < 24 hours before
    
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    const zones = await db.collection('zones').find({}).toArray()
    let emailsSent = 0

    // Mock Transporter (Replace with real SMTP credentials in .env)
    // For demo, we just log the emails that WOULD be sent.
    // To enable real emails, configure NODEMAILER_HOST, etc.
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
    */

    for (const zone of zones) {
      if (!zone.workRecords) continue

      for (const work of zone.workRecords) {
        if (work.status === 'complete' || work.reminderSent || !work.deadline) continue

        const deadline = new Date(work.deadline)
        let shouldSend = false

        if (work.workType === 'FPP') {
           // If deadline is within next 7 days and hasn't passed
           if (deadline > now && deadline <= oneWeekFromNow) {
             shouldSend = true
           }
        } else if (work.workType === 'WPP') {
           // If deadline is within next 24 hours
           if (deadline > now && deadline <= twentyFourHoursFromNow) {
             shouldSend = true
           }
        }

        if (shouldSend) {
          // Find manager email for this zone
          // In a real app, join with users collection. 
          // Here assuming pattern manager{id}@company.com
          const managerEmail = `manager${zone.id}@company.com`
          
          console.log(`[REMINDER] Sending email to ${managerEmail} for Work ID ${work._id} (Due: ${deadline})`)
          
          // Mark as sent
          await db.collection('zones').updateOne(
            { id: zone.id, "workRecords._id": work._id },
            { $set: { "workRecords.$.reminderSent": true } }
          )
          
          emailsSent++
        }
      }
    }

    await client.close()

    return Response.json({ success: true, emailsSent })
  } catch (error) {
    console.error('Reminder error:', error)
    return Response.json({ error: 'Reminder check failed' }, { status: 500 })
  }
}
