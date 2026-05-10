const router = require('express').Router()
const prisma = require('../lib/prisma')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const QRCode = require('qrcode')

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object
    try {
      const payment = await prisma.payment.findUnique({
        where: { stripePaymentIntentId: intent.id },
        include: { booking: true }
      })
      if (!payment) return res.json({ received: true })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'SUCCEEDED' }
      })

      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' }
      })

      const qrData = JSON.stringify({
        bookingId: payment.bookingId,
        userId: payment.booking.userId,
        eventId: payment.booking.eventId
      })
      const qrCode = await QRCode.toDataURL(qrData)

      await prisma.ticket.create({
        data: { bookingId: payment.bookingId, qrCode }
      })

      console.log(`Booking ${payment.bookingId} confirmed, ticket generated`)
    } catch (err) {
      console.error('Error processing webhook:', err)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object
    try {
      await prisma.payment.updateMany({
        where: { stripePaymentIntentId: intent.id },
        data: { status: 'FAILED' }
      })
    } catch (err) {
      console.error('Error handling failed payment:', err)
    }
  }

  res.json({ received: true })
})

module.exports = router
