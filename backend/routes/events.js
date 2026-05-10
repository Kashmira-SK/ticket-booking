const router = require('express').Router()
const prisma = require('../lib/prisma')
const auth = require('../middleware/auth')
const adminOnly = require('../middleware/adminOnly')

// GET /api/events — list all events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: { seatCategories: true },
      orderBy: { date: 'asc' }
    })
    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/events/:id — get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: Number(req.params.id) },
      include: { seatCategories: true }
    })
    if (!event) return res.status(404).json({ error: 'Event not found' })
    res.json(event)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/events — create event (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, venue, date, posterUrl, seatCategories } = req.body
    if (!title || !description || !venue || !date || !seatCategories?.length)
      return res.status(400).json({ error: 'Missing required fields' })

    const event = await prisma.event.create({
      data: {
        title,
        description,
        venue,
        date: new Date(date),
        posterUrl,
        seatCategories: {
          create: seatCategories.map(cat => ({
            name: cat.name,
            price: cat.price,
            totalSeats: cat.totalSeats,
            availableSeats: cat.totalSeats
          }))
        }
      },
      include: { seatCategories: true }
    })
    res.status(201).json(event)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/events/:id — update event (admin only)
router.patch('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { title, description, venue, date, posterUrl } = req.body
    const event = await prisma.event.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(venue && { venue }),
        ...(date && { date: new Date(date) }),
        ...(posterUrl && { posterUrl })
      },
      include: { seatCategories: true }
    })
    res.json(event)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// DELETE /api/events/:id — delete event (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: 'Event deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
