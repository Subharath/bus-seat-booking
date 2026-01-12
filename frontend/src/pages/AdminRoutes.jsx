import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

const SRI_LANKAN_CITIES = [
  'Colombo',
  'Kandy',
  'Galle',
  'Matara',
  'Negombo',
  'Kalutara',
  'Kurunegala',
  'Anuradhapura',
  'Jaffna',
  'Vavuniya',
  'Trincomalee',
  'Batticaloa',
  'Badulla',
  'Nuwara Eliya',
  'Hatton',
  'Tangalle'
]

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ from: '', to: '' })
  const [error, setError] = useState(null)

  useEffect(() => { fetchRoutes() }, [])

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.routes.getAll()
      setRoutes(res.data.routes || res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load routes')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await adminAPI.routes.create({
        from: form.from.trim(),
        to: form.to.trim()
      })
      setForm({ from: '', to: '' })
      fetchRoutes()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create route')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Routes</h2>

      {/* City dropdown list */}
      <datalist id="cities">
        {SRI_LANKAN_CITIES.map(city => (
          <option key={city} value={city} />
        ))}
      </datalist>

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input
          name="from"
          list="cities"
          value={form.from}
          onChange={handleChange}
          placeholder="From (select or type)"
          className="input"
          required
        />

        <input
          name="to"
          list="cities"
          value={form.to}
          onChange={handleChange}
          placeholder="To (select or type)"
          className="input"
          required
        />

        <button className="btn btn-primary">Create</button>
      </form>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div>Loading routes...</div>
      ) : (
        <div className="space-y-3">
          {routes.length === 0 && <div>No routes yet.</div>}
          {routes.map(r => (
            <div
              key={r.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>{r.from} → {r.to}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
