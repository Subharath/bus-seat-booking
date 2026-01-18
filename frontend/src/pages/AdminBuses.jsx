import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import AdminHeader from '../components/layout/AdminHeader'

const INITIAL_CATALOG = {
  'Ashok Leyland': ['Viking', 'Challenger', 'Stag', 'Oyster'],
  'Tata': ['Starbus', 'Marcopolo', 'LP 912', 'LP 1512'],
  'Yutong': ['ZK6127', 'ZK6118', 'ZK6129'],
  'Mitsubishi Fuso': ['Rosa', 'Canter'],
  'Nissan (Civilian)': ['Civilian 26', 'Civilian 29'],
  'Isuzu': ['Journey J', 'Elf', 'NQR'],
  'Volvo': ['B7R', 'B8R', 'B11R'],
  'Scania': ['K310', 'K360', 'K400'],
}

export default function AdminBuses() {
  const [catalog, setCatalog] = useState(INITIAL_CATALOG)
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [adminUser, setAdminUser] = useState(null)

  const [form, setForm] = useState({
    busNumber: '',
    make: '',
    model: '',
    totalSeats: '',
    customMake: '',
  })

  const isCustomMake = form.make === '__CUSTOM__'
  const models =
    !isCustomMake && form.make ? catalog[form.make] || [] : []

  useEffect(() => {
    const adminData = localStorage.getItem('adminUser')
    if (adminData) setAdminUser(JSON.parse(adminData))
    fetchBuses()
  }, [])

  const fetchBuses = async () => {
    try {
      const res = await adminAPI.buses.getAll()
      setBuses(res.data.buses || res.data)
    } catch {
      setError('Failed to load buses')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    let { name, value } = e.target

    if (name === 'busNumber') {
      value = value.toUpperCase()
      if (value.length === 2 && !value.includes('-')) value += '-'
    }

    if (name === 'totalSeats') {
      value = value.replace(/\D/g, '')
    }

    setForm({ ...form, [name]: value })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    let finalMake = form.make
    if (isCustomMake) {
      finalMake = form.customMake.trim()
      if (!finalMake) {
        setError('Please enter new bus make')
        return
      }
      setCatalog({ ...catalog, [finalMake]: [] })
    }

    try {
      await adminAPI.buses.create({
        busNumber: form.busNumber,
        make: finalMake,
        model: form.model,
        totalSeats: Number(form.totalSeats),
      })

      setSuccess('Bus created successfully')
      setForm({
        busNumber: '',
        make: '',
        model: '',
        totalSeats: '',
        customMake: '',
      })
      fetchBuses()
    } catch {
      setError('Failed to create bus')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader adminUser={adminUser} />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <h2 className="text-2xl font-bold">🚍 Bus Management</h2>

      {/* FORM */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl shadow p-6 space-y-6"
      >
        {error && <div className="bg-red-100 p-3 rounded">{error}</div>}
        {success && <div className="bg-green-100 p-3 rounded">{success}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            name="busNumber"
            value={form.busNumber}
            onChange={handleChange}
            placeholder="Bus No (e.g. NP-4567)"
            className="input"
            required
          />

          <input
            name="totalSeats"
            value={form.totalSeats}
            onChange={handleChange}
            placeholder="Total Seats (e.g. 54)"
            className="input"
            required
          />

          {/* MAKE */}
          <select
            value={form.make}
            onChange={(e) =>
              setForm({ ...form, make: e.target.value, model: '' })
            }
            className="input"
            required
          >
            <option value="">Select Bus Make</option>
            {Object.keys(catalog).map((m) => (
              <option key={m}>{m}</option>
            ))}
            <option value="__CUSTOM__">➕ Add New Make</option>
          </select>

          {isCustomMake && (
            <input
              name="customMake"
              value={form.customMake}
              onChange={handleChange}
              placeholder="Enter new make (e.g. NCG Express)"
              className="input"
            />
          )}

          {/* MODEL */}
          {models.length > 0 ? (
            <select
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Model</option>
              {models.map((m) => (
                <option key={m}>{m}</option>
              ))}
              <option value="Custom">Other / Custom</option>
            </select>
          ) : (
            <input
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="Enter Model"
              className="input"
              required
            />
          )}
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          ➕ Create Bus
        </button>
      </form>

      {/* BUS LIST */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading ? (
          <p>Loading…</p>
        ) : (
          buses.map((bus) => (
            <div
              key={bus.id}
              className="bg-white rounded-xl shadow p-4 flex justify-between"
            >
              <div>
                <h4 className="font-bold text-blue-600">{bus.busNumber}</h4>
                <p className="text-sm">
                  {bus.make} • {bus.model}
                </p>
                <p className="text-xs text-gray-500">
                  Seats: {bus.totalSeats}
                </p>
              </div>
              <button
                onClick={() => adminAPI.buses.delete(bus.id).then(fetchBuses)}
                className="text-red-600 hover:bg-red-100 px-3 rounded"
              >
                🗑
              </button>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  )
}
