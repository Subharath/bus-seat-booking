import React, { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'

export default function AdminSchedules(){
  const [schedules, setSchedules] = useState([])
  const [buses, setBuses] = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ date: '', time: '', busId: '', routeId: '', ticketPrice: '' })
  const [error, setError] = useState(null)

  useEffect(()=>{
    fetchAll()
  },[])

  const fetchAll = async ()=>{
    try{
      setLoading(true)
      const [sRes, bRes, rRes] = await Promise.all([
        adminAPI.schedules.getAll(),
        adminAPI.buses.getAll(),
        adminAPI.routes.getAll(),
      ])

      setSchedules(sRes.data.schedules || sRes.data)
      setBuses(bRes.data.buses || bRes.data)
      setRoutes(rRes.data.routes || rRes.data)
    }catch(err){
      setError(err.response?.data?.message || 'Failed to load data')
    }finally{ setLoading(false) }
  }

  const handleChange = e => setForm({...form, [e.target.name]: e.target.value})

  const handleCreate = async (e) =>{
    e.preventDefault()
    try{
      await adminAPI.schedules.create({
        date: form.date,
        time: form.time,
        busId: Number(form.busId),
        routeId: Number(form.routeId),
        ticketPrice: Number(form.ticketPrice),
      })
      setForm({ date: '', time: '', busId: '', routeId: '', ticketPrice: '' })
      fetchAll()
    }catch(err){
      setError(err.response?.data?.message || 'Failed to create schedule')
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Schedules</h2>

      <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-4">
        <input name="date" type="date" value={form.date} onChange={handleChange} className="input" required />
        <input name="time" type="time" value={form.time} onChange={handleChange} className="input" required />
        <select name="busId" value={form.busId} onChange={handleChange} className="input" required>
          <option value="">Select Bus</option>
          {buses.map(b=> <option key={b.id} value={b.id}>{b.busNumber}</option>)}
        </select>
        <select name="routeId" value={form.routeId} onChange={handleChange} className="input" required>
          <option value="">Select Route</option>
          {routes.map(r=> <option key={r.id} value={r.id}>{r.from} → {r.to}</option>)}
        </select>
        <input name="ticketPrice" type="number" placeholder="Price (Rs)" value={form.ticketPrice} onChange={handleChange} className="input" required min="1" />
        <div className="md:col-span-5">
          <button className="btn btn-primary mt-2">Create Schedule</button>
        </div>
      </form>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? <div>Loading schedules...</div> : (
        <div className="space-y-3">
          {schedules.length === 0 && <div>No schedules yet.</div>}
          {schedules.map(s => (
            <div key={s.id} className="p-4 bg-white rounded shadow">
              <div className="font-semibold">{new Date(s.date).toLocaleDateString()} {s.time}</div>
              <div className="text-sm text-gray-600">Bus: {s.bus?.busNumber} — Route: {s.route?.from} → {s.route?.to}</div>
              <div className="text-sm text-primary-600 font-medium">Price: Rs. {s.ticketPrice}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
