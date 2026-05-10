require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/auth',     require('./routes/auth'))
app.use('/api/events',   require('./routes/events'))
app.use('/api/bookings', require('./routes/bookings'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/admin',    require('./routes/admin'))

app.get('/', (req, res) => res.json({ status: 'Ticket API running' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
