import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { paymentAPI } from '../services/api'

const Payment = () => {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await paymentAPI.initiate(bookingId)
      const { paymentData, paymentUrl } = response.data

      // PayHere requires a form POST - create and submit dynamically
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = paymentUrl

      Object.entries(paymentData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        }
      })

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">💳</div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <p className="text-gray-600 mt-2 text-sm">
              You will be securely redirected to PayHere to complete your payment.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* PayHere Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-semibold">🔒 Secure Payment via PayHere</p>
            <p className="text-xs text-blue-600 mt-1">
              Your payment is processed securely. We do not store your card details.
            </p>
          </div>

          {/* Booking Reference */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-700">
            <p><span className="font-semibold">Booking ID:</span> #{bookingId}</p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Redirecting to PayHere...
              </>
            ) : (
              '💳 Pay Now with PayHere'
            )}
          </button>

          {/* Go Back */}
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-outline w-full mt-3"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment