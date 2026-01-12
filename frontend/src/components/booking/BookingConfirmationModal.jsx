import { useState } from 'react'

const BookingConfirmationModal = ({ bookingIds, seats, schedule, onClose }) => {
  const [downloading, setDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      // Create a professional PDF with booking details
      const html = generateTicketHTML(bookingIds, seats, schedule)
      
      // Use html2pdf library or create a download method
      const element = document.createElement('div')
      element.innerHTML = html
      element.style.display = 'none'
      document.body.appendChild(element)
      
      // For now, we'll create a simple printable format
      const printWindow = window.open('', '', 'height=600,width=800')
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .ticket-container { max-width: 600px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 15px; }
              .logo { font-size: 28px; font-weight: bold; color: #0066cc; }
              .subtitle { color: #666; margin-top: 5px; }
              .booking-section { margin-bottom: 25px; padding: 15px; background: #f9f9f9; border-left: 4px solid #0066cc; }
              .booking-title { font-size: 14px; color: #0066cc; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; }
              .booking-id { font-size: 18px; font-weight: bold; font-family: 'Courier New', monospace; color: #000; margin-bottom: 15px; }
              .seat-info { font-size: 16px; font-weight: bold; margin-bottom: 10px; }
              .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px 0; border-bottom: 1px dotted #ddd; }
              .info-label { color: #666; font-weight: bold; }
              .info-value { text-align: right; }
              .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 12px; }
              .checkmark { color: #28a745; font-size: 48px; text-align: center; margin-bottom: 20px; }
              .important { background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="ticket-container">
              <div class="header">
                <div class="logo">🎫 LankaRoute Tickets</div>
                <div class="subtitle">Confirmed Reservations</div>
              </div>
              
              <div class="checkmark">✓</div>
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h2 style="color: #28a745; margin: 0;">Booking Confirmed!</h2>
                <p style="color: #666;">Your seat(s) have been successfully reserved</p>
              </div>

              ${bookingIds.map((bookingId, index) => `
                <div class="booking-section">
                  <div class="booking-title">Ticket ${index + 1}</div>
                  <div class="booking-id">ID: ${bookingId}</div>
                  <div class="seat-info">Seat: ${seats[index]?.seatNo}</div>
                  
                  <div class="info-row">
                    <span class="info-label">Route:</span>
                    <span class="info-value">${schedule?.route?.from} → ${schedule?.route?.to}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Date:</span>
                    <span class="info-value">${new Date(schedule?.date).toLocaleDateString()}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">${schedule?.time}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Bus:</span>
                    <span class="info-value">${schedule?.bus?.busNumber}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Price:</span>
                    <span class="info-value">Rs. ${schedule?.ticketPrice}</span>
                  </div>
                </div>
              `).join('')}

              <div class="important">
                <strong>📌 Important:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Please arrive 30 minutes before departure</li>
                  <li>Keep your booking ID safe</li>
                  <li>Cancellations must be requested at least 24 hours before departure</li>
                  <li>A confirmation email has been sent to your registered email address</li>
                </ul>
              </div>

              <div class="footer">
                <p>Thank you for booking with us! Have a great journey!</p>
                <p style="margin-top: 10px; font-size: 11px;">Printed on ${new Date().toLocaleString()}</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    } catch (err) {
      console.error('Error downloading PDF:', err)
    } finally {
      setDownloading(false)
    }
  }

  const totalPrice = (seats?.length || 0) * (schedule?.ticketPrice || 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 text-center">
          <div className="text-5xl mb-3">✓</div>
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="text-green-100 mt-2">Your seat(s) have been successfully reserved</p>
        </div>

        {/* Booking Details */}
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-600 font-semibold uppercase mb-2">Confirmation Details</p>
            {bookingIds.map((id, idx) => (
              <div key={idx} className="mb-2">
                <p className="text-xs text-gray-600">Booking #{idx + 1}:</p>
                <p className="font-mono text-sm font-bold text-blue-700 break-all">{id}</p>
              </div>
            ))}
          </div>

          {/* Journey Details */}
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800">Journey Details</h3>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Route:</span>
              <span className="font-medium">{schedule?.route?.from} → {schedule?.route?.to}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{new Date(schedule?.date).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{schedule?.time}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Bus:</span>
              <span className="font-medium">{schedule?.bus?.busNumber}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Seats:</span>
              <span className="font-medium">{seats?.map(s => s.seatNo).join(', ')}</span>
            </div>

            <div className="pt-3 border-t flex justify-between text-sm font-semibold">
              <span>Total Price:</span>
              <span className="text-green-600">Rs. {totalPrice}</span>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-yellow-800 mb-2">📌 Important</p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Arrive 30 minutes before departure</li>
              <li>• Keep your booking ID safe</li>
              <li>• Confirmation sent to your email</li>
              <li>• Cancel 24+ hours before departure</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-gray-50 px-6 py-4 border-t space-y-3">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <span className="animate-spin">⌛</span> Generating PDF...
              </>
            ) : (
              <>
                <span>📄</span> Download Tickets (PDF)
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

function generateTicketHTML(bookingIds, seats, schedule) {
  // This function can be expanded for more complex HTML generation
  return ''
}

export default BookingConfirmationModal
