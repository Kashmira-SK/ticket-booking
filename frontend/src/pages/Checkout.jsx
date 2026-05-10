import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

function CheckoutForm({ booking }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.origin + '/my-tickets' },
        redirect: 'if_required'
      })
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Payment successful! Your ticket is confirmed.')
        navigate('/my-tickets')
      }
    } catch (err) {
      toast.error('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
      >
        {loading ? 'Processing...' : `Pay LKR ${booking.seatCategory.price * booking.quantity}`}
      </button>
    </form>
  )
}

export default function Checkout() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state?.clientSecret || !state?.booking) {
    navigate('/')
    return null
  }

  const { clientSecret, booking } = state

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <div className="space-y-2 text-sm text-gray-300 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-400">Event</span>
            <span>{booking.event.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Category</span>
            <span>{booking.seatCategory.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Quantity</span>
            <span>{booking.quantity}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-800">
            <span>Total</span>
            <span className="text-violet-400">LKR {(booking.seatCategory.price * booking.quantity).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'night' } }}>
          <CheckoutForm booking={booking} />
        </Elements>
      </div>
    </div>
  )
}
