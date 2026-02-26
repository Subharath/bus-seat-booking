import { useNavigate } from 'react-router-dom'

const PaymentSuccess = () => {
  const navigate = useNavigate()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-2">
            Your payment has been received and your booking is confirmed.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            You can download your ticket from the dashboard.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess