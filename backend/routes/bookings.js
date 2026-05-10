const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

router.post('/', auth, async (req, res) => {
  try {
    const { eventId, seatCategoryId, quantity } = req.body
    if (!eventId || !seatCategoryId || !quantity)
      return res.status(400).json({ error: 'Missing required fields' })

    const seatCategory = await prisma.seatCategory.findUnique({
      where: { id: Number(seatCategoryId) }
    })
    if (!seatCategory)
      return res.status(404).json({ error: 'Seat category not found' })
    if (seatCategory.availableSeats < quantity)
      return res.status(409).json({ error: 'Not enough seats available' })

    const amount = seatCategory.price * quantity

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'lkr',
      metadata: { userId: req.user.id, eventId, seatCategoryId, quantity }
    })

    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        eventId: Number(eventId),
        seatCategoryId: Number(seatCategoryId),
        quantity: Number(quantity),
        status: 'PENDING',
        payment: {
          create: {
            stripePaymentIntentId: paymentIntent.id,
            amount,
            status: 'PENDING'
          }
        }
      },
      include: { payment: true, event: true, seatCategory: true }
    })

    await prisma.seatCategory.update({
      where: { id: Number(seatCategoryId) },
      data: { availableSeats: { decrement: Number(quantity) } }
    })

    res.status(201).json({ booking, clientSecret: paymentIntent.client_secret })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/my', auth, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: { event: true, seatCategory: true, tickets: true, payment: true },
      orderBy: { createdAt: 'desc' }
    })
    res.json(bookings)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: Number(req.params.id) },
      include: { event: true, seatCategory: true, tickets: true, payment: true }
    })
    if (!booking) return res.status(404).json({ error: 'Booking not found' })
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Forbidden' })
    res.json(booking)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
