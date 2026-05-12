import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const appearance = {
  theme: 'night',
  variables: {
    colorPrimary: '#7c3aed',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
  },
};

function PaymentForm({ booking, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: `${window.location.origin}/my-tickets` },
        redirect: 'if_required',
      });
      if (error) {
        toast.error(error.message);
      } else if (paymentIntent?.status === 'succeeded') {
        await api.post(`/bookings/${booking.id}/confirm`);
        toast.success('Payment successful!');
        navigate('/my-tickets');
      }
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const total = booking.seatCategory?.price * booking.quantity;

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      {/* Order summary */}
      <div className="bg-[#111118] rounded-2xl p-5 border border-white/5 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Order Summary
        </p>
        <h2 className="text-lg font-bold text-white mb-1">
          {booking.event?.name}
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          {booking.seatCategory?.name} × {booking.quantity}
        </p>
        <div className="border-t border-white/5 pt-4 flex items-center justify-between">
          <span className="text-sm text-gray-400">Total</span>
          <span className="text-lg font-bold text-violet-400">
            LKR {total?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-[#111118] rounded-2xl p-5 border border-white/5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Payment Details
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <PaymentElement />
          <button
            type="submit"
            disabled={processing || !stripe}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Processing…' : `Pay LKR ${total?.toLocaleString()}`}
          </button>
        </form>
        <div className="flex items-center justify-center gap-2 mt-4 text-gray-600 text-xs">
          <Lock className="w-3.5 h-3.5" />
          <span>Payments secured by Stripe</span>
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

export default function Checkout() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        setBooking(bookingRes.data);
        const intentRes = await api.post(`/payments/create-intent`, { bookingId });
        setClientSecret(intentRes.data.clientSecret);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 animate-pulse flex flex-col gap-4">
        <div className="bg-[#111118] rounded-2xl h-40 border border-white/5" />
        <div className="bg-[#111118] rounded-2xl h-64 border border-white/5" />
      </div>
    );
  }

  if (!booking || !clientSecret) {
    return (
      <div className="text-center py-24 text-gray-400">Unable to load checkout.</div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
      <PaymentForm booking={booking} clientSecret={clientSecret} />
    </Elements>
  );
}
