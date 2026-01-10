import { useState, useEffect } from 'react'

const SeatMap = ({ bus, availableSeats, selectedSeat, onSeatSelect }) => {
  const [seatLayout, setSeatLayout] = useState(null)
  const [seatGrid, setSeatGrid] = useState([])

  useEffect(() => {
    if (bus?.seatLayout) {
      setSeatLayout(bus.seatLayout)
      generateSeatGrid(bus.seatLayout, availableSeats)
    } else if (bus?.seats) {
      // Fallback: generate layout from seats array
      generateLayoutFromSeats(bus.seats, availableSeats)
    }
  }, [bus, availableSeats])

  const generateLayoutFromSeats = (seats, available) => {
    // Group seats by row
    const seatsByRow = {}
    seats.forEach((seat) => {
      const row = seat.seatNo.match(/^([A-Z]+)/)?.[1] || 'A'
      if (!seatsByRow[row]) {
        seatsByRow[row] = []
      }
      seatsByRow[row].push(seat)
    })

    // Create grid
    const grid = []
    Object.keys(seatsByRow).sort().forEach((row) => {
      const rowSeats = seatsByRow[row].sort((a, b) => {
        const numA = parseInt(a.seatNo.match(/\d+/)?.[0] || '0')
        const numB = parseInt(b.seatNo.match(/\d+/)?.[0] || '0')
        return numA - numB
      })
      grid.push(rowSeats)
    })

    setSeatGrid(grid)
  }

  const generateSeatGrid = (layout, available) => {
    if (layout.seats && layout.seats.length > 0) {
      // Use layout.seats if available
      const seatsByRow = {}
      layout.seats.forEach((seatConfig) => {
        const row = seatConfig.seatNo.match(/^([A-Z]+)/)?.[1] || 'A'
        if (!seatsByRow[row]) {
          seatsByRow[row] = []
        }
        // Find matching seat from available seats
        const seat = available.find((s) => s.seatNo === seatConfig.seatNo) || {
          seatNo: seatConfig.seatNo,
          id: null,
        }
        seatsByRow[row].push({
          ...seat,
          ...seatConfig,
        })
      })

      const grid = []
      Object.keys(seatsByRow).sort().forEach((row) => {
        const rowSeats = seatsByRow[row].sort((a, b) => {
          const numA = parseInt(a.seatNo.match(/\d+/)?.[0] || '0')
          const numB = parseInt(b.seatNo.match(/\d+/)?.[0] || '0')
          return numA - numB
        })
        grid.push(rowSeats)
      })

      setSeatGrid(grid)
    } else {
      // Fallback to bus.seats
      if (bus?.seats) {
        generateLayoutFromSeats(bus.seats, available)
      }
    }
  }

  const getSeatStatus = (seat) => {
    if (selectedSeat?.id === seat.id) return 'selected'
    const isAvailable = availableSeats.some((s) => s.id === seat.id)
    return isAvailable ? 'available' : 'booked'
  }

  const getSeatColor = (status, isReserved = false) => {
    if (isReserved) return 'bg-purple-500 cursor-not-allowed opacity-60'
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600'
      case 'booked':
        return 'bg-red-500 cursor-not-allowed opacity-60'
      case 'selected':
        return 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-700'
      default:
        return 'bg-gray-300'
    }
  }

  const isReservedSeat = (seatNo, rowIndex) => {
    // First row (index 0): first 4 seats are reserved
    if (rowIndex === 0) {
      const seatNum = parseInt(seatNo.match(/\d+/)?.[0] || '0')
      return seatNum <= 4
    }
    return false
  }

  if (!seatGrid.length) {
    return (
      <div className="card">
        <p className="text-gray-600">Loading seat map...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Seat Map</h2>
        {bus && (
          <p className="text-sm text-gray-600">
            {bus.busNumber} - {bus.make} {bus.model}
          </p>
        )}
      </div>

      {/* Driver Area */}
      <div className="mb-4 text-center">
        <div className="inline-block bg-gray-200 px-4 py-2 rounded text-sm font-medium">
          🚗 Driver
        </div>
      </div>

      {/* Seat Grid */}
      <div className="space-y-3">
        {seatGrid.map((row, rowIndex) => {
          // Determine layout based on row: first rows are 2x2, last row is 5 seats
          const isLastRow = rowIndex === seatGrid.length - 1

          return (
            <div key={rowIndex} className="flex items-center justify-center gap-4">
              {/* Row Label */}
              <div className="w-8 text-sm font-medium text-gray-700">
                {row[0]?.seatNo.match(/^([A-Z]+)/)?.[1] || ''}
              </div>

              {/* Seats Container - 2x2 layout with aisle or 5 seats for last row */}
              {isLastRow ? (
                // Last row: 5 seats in a line
                <div className="flex gap-3">
                  {row.map((seat, seatIndex) => {
                    const reserved = isReservedSeat(seat.seatNo, rowIndex)
                    const status = reserved ? 'reserved' : getSeatStatus(seat)
                    const isClickable = !reserved && (status === 'available' || status === 'selected')

                    return (
                      <button
                        key={seatIndex}
                        onClick={() => isClickable && onSeatSelect(seat)}
                        disabled={!isClickable}
                        className={`
                          w-12 h-12 rounded text-white font-medium text-sm
                          transition-all duration-200
                          ${getSeatColor(status, reserved)}
                          ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                        `}
                        title={`Seat ${seat.seatNo} - ${reserved ? 'Reserved' : status}`}
                      >
                        {seat.seatNo.match(/\d+/)?.[0] || seatIndex + 1}
                      </button>
                    )
                  })}
                </div>
              ) : (
                // Regular rows: 2x2 layout with aisle gap
                <div className="flex gap-8">
                  {/* Left column (2 seats) */}
                  <div className="flex gap-3">
                    {row.slice(0, 2).map((seat, seatIndex) => {
                      const reserved = isReservedSeat(seat.seatNo, rowIndex)
                      const status = reserved ? 'reserved' : getSeatStatus(seat)
                      const isClickable = !reserved && (status === 'available' || status === 'selected')

                      return (
                        <button
                          key={seatIndex}
                          onClick={() => isClickable && onSeatSelect(seat)}
                          disabled={!isClickable}
                          className={`
                            w-12 h-12 rounded text-white font-medium text-sm
                            transition-all duration-200
                            ${getSeatColor(status, reserved)}
                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                          `}
                          title={`Seat ${seat.seatNo} - ${reserved ? 'Reserved' : status}`}
                        >
                          {seat.seatNo.match(/\d+/)?.[0] || seatIndex + 1}
                        </button>
                      )
                    })}
                  </div>

                  {/* Aisle Separator */}
                  <div className="w-1 h-12 bg-gray-300 rounded opacity-50"></div>

                  {/* Right column (2 seats) */}
                  <div className="flex gap-3">
                    {row.slice(2, 4).map((seat, seatIndex) => {
                      const reserved = isReservedSeat(seat.seatNo, rowIndex)
                      const status = reserved ? 'reserved' : getSeatStatus(seat)
                      const isClickable = !reserved && (status === 'available' || status === 'selected')

                      return (
                        <button
                          key={seatIndex + 2}
                          onClick={() => isClickable && onSeatSelect(seat)}
                          disabled={!isClickable}
                          className={`
                            w-12 h-12 rounded text-white font-medium text-sm
                            transition-all duration-200
                            ${getSeatColor(status, reserved)}
                            ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                          `}
                          title={`Seat ${seat.seatNo} - ${reserved ? 'Reserved' : status}`}
                        >
                          {seat.seatNo.match(/\d+/)?.[0] || seatIndex + 3}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Reserved</span>
        </div>
      </div>
    </div>
  )
}

export default SeatMap
