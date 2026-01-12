import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminBookings(){
  const [bookings, setBookings] = useState([])
  const [cancellations, setCancellations] = useState([])
  const [activeTab, setActiveTab] = useState('bookings') // 'bookings' or 'cancellations'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(()=>{ 
    fetchData()
  },[])

  const fetchData = async ()=>{
    try{
      setLoading(true)
      const bookingsRes = await adminAPI.bookings.getAll()
      setBookings(bookingsRes.data.bookings || bookingsRes.data)
      
      const cancellationsRes = await adminAPI.cancellations.getPending()
      setCancellations(cancellationsRes.data.cancellations || [])
    }catch(err){ 
      setError(err.response?.data?.message || 'Failed to load data') 
    }finally{ 
      setLoading(false) 
    }
  }

  const handleApprove = async (bookingId) => {
    if(!confirm('Approve this cancellation request?')) return
    try{
      await adminAPI.cancellations.approve(bookingId, { adminNotes })
      setAdminNotes('')
      setSelectedBooking(null)
      fetchData()
    }catch(err){ 
      setError(err.response?.data?.message || 'Failed to approve cancellation') 
    }
  }

  const handleReject = async (bookingId) => {
    if(!confirm('Reject this cancellation request?')) return
    try{
      await adminAPI.cancellations.reject(bookingId, { reason: adminNotes })
      setAdminNotes('')
      setSelectedBooking(null)
      fetchData()
    }catch(err){ 
      setError(err.response?.data?.message || 'Failed to reject cancellation') 
    }
  }

  const handleDelete = async (id)=>{
    if(!confirm('Delete booking?')) return
    try{
      await adminAPI.bookings.delete(id)
      fetchData()
    }catch(err){ 
      setError(err.response?.data?.message || 'Failed to delete booking') 
    }
  }

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-blue-100 text-blue-800'
      case 'REJECTED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bookings Management</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded font-semibold transition ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('cancellations')}
          className={`px-4 py-2 rounded font-semibold transition ${
            activeTab === 'cancellations'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Cancellation Requests ({cancellations.length})
        </button>
      </div>

      {loading ? (
        <div className="text-gray-600">Loading...</div>
      ) : activeTab === 'bookings' ? (
        <div className="space-y-3">
          {bookings.length === 0 && <div className="text-gray-600">No bookings found.</div>}
          {bookings.map(b => (
            <div key={b.id} className="p-4 bg-white rounded shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-semibold">{b.passengerName || b.user?.name || 'Passenger'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {b.schedule?.route?.from} → {b.schedule?.route?.to}
                  </div>
                  <div className="text-sm text-gray-600">
                    Seat: {b.seat?.seatNo} | Bus: {b.schedule?.bus?.busNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(b.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={()=>handleDelete(b.id)} 
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {cancellations.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4 text-blue-800">
              No pending cancellation requests at the moment.
            </div>
          )}
          {cancellations.map(c => (
            <div key={c.id} className="p-4 bg-white rounded shadow border-l-4 border-yellow-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold">{c.passengerName || c.user?.name || 'Passenger'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Email:</span> {c.user?.email}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {c.user?.phone || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Route:</span> {c.schedule?.route?.from} → {c.schedule?.route?.to}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Seat:</span> {c.seat?.seatNo} | <span className="font-medium">Bus:</span> {c.schedule?.bus?.busNumber}
                  </div>
                  {c.cancellationReason && (
                    <div className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Reason:</span> {c.cancellationReason}
                    </div>
                  )}
                  <div className="text-sm text-gray-500 mt-2">
                    Requested: {new Date(c.cancellationRequestedAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="border-l pl-4">
                  {selectedBooking === c.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Admin Notes
                        </label>
                        <textarea
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                          placeholder="Optional notes..."
                          rows="3"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold text-sm transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(c.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold text-sm transition"
                        >
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedBooking(null)}
                        className="w-full bg-gray-400 hover:bg-gray-500 text-white py-2 rounded font-semibold text-sm transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedBooking(c.id)}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded font-semibold text-sm transition"
                    >
                      Review & Respond
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
