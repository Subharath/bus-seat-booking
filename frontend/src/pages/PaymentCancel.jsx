import { useNavigate, useSearchParams } from 'react-router-dom'

const PaymentCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-2">
            Your payment was cancelled. Your booking is still saved.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You can retry payment anytime from your dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentCancel