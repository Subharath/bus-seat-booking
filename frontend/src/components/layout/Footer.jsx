const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Bus Booking</h3>
            <p className="text-gray-400">
              Your trusted partner for bus seat booking in Sri Lanka.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="/routes" className="hover:text-white transition-colors">
                  View Routes
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-white transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-gray-400">
              Email: support@busbooking.lk
              <br />
              Phone: +94 11 234 5678
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Bus Booking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
