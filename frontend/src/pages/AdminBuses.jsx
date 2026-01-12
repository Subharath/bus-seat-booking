import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminBuses() {
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ busNumber: '', make: '', model: '', totalSeats: '' })

  useEffect(() => {
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.buses.getAll()
      setBuses(res.data.buses || res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load buses')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.buses.create({
        busNumber: form.busNumber,
        make: form.make || null,
        model: form.model || null,
        totalSeats: form.totalSeats ? Number(form.totalSeats) : null,
      })
      setForm({ busNumber: '', make: '', model: '', totalSeats: '' })
      fetchBuses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create bus')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bus?')) return
    try {
      await adminAPI.buses.delete(id)
      fetchBuses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bus')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Buses</h2>

      <div className="mb-6">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input name="busNumber" value={form.busNumber} onChange={handleChange} placeholder="Bus Number" className="input" required />
          <input name="make" value={form.make} onChange={handleChange} placeholder="Make" className="input" />
          <input name="model" value={form.model} onChange={handleChange} placeholder="Model" className="input" />
          <input name="totalSeats" value={form.totalSeats} onChange={handleChange} placeholder="Total Seats" type="number" className="input" />
          <button type="submit" className="btn btn-primary col-span-1 md:col-span-1">Create Bus</button>
        </form>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div>Loading buses...</div>
      ) : (
        <div className="space-y-3">
          {buses.length === 0 && <div>No buses yet.</div>}
          {buses.map((bus) => (
            <div key={bus.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
              <div>
                <div className="font-semibold">{bus.busNumber}</div>
                <div className="text-sm text-gray-500">{bus.make} {bus.model} • Seats: {bus.totalSeats || 'N/A'}</div>
              </div>
              <div>
                <button onClick={() => handleDelete(bus.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
