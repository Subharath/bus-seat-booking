# 📊 Database Schema Enhancements - Summary

## ✅ What Was Enhanced

### 1. **Bus Model Enhancements**

Added new fields to support different bus types and seat configurations:

```prisma
model Bus {
  id         Int      @id @default(autoincrement())
  busNumber  String   @unique
  make       String?  // e.g., "Ashok Leyland", "Tata", "Volvo"
  model      String?  // e.g., "Viking", "Leyland", "B7R"
  seatLayout Json?    // Dynamic seat configuration
  totalSeats Int?     // Total number of seats
  seats      Seat[]
  schedules  Schedule[]
}
```

**New Fields:**
- `make` - Bus manufacturer (e.g., "Ashok Leyland", "Tata", "Volvo")
- `model` - Bus model (e.g., "Viking", "Leyland", "B7R")
- `seatLayout` - JSON field storing dynamic seat configuration
- `totalSeats` - Total number of seats in the bus

---

### 2. **Booking Model Enhancements**

Added passenger details and unique booking ID:

```prisma
model Booking {
  id            Int       @id @default(autoincrement())
  bookingId     String?   @unique @default(uuid()) // Unique booking identifier
  userId        Int
  seatId        Int
  scheduleId    Int
  passengerName String?   // Passenger name (can differ from user name)
  phoneNumber   String?   // Passenger phone number
  status        BookingStatus @default(CONFIRMED)
  createdAt     DateTime  @default(now())
  // ... relations
}
```

**New Fields:**
- `bookingId` - Unique UUID for user-friendly booking reference
- `passengerName` - Name of the passenger (can be different from user's name)
- `phoneNumber` - Passenger's phone number

---

## 🎨 Seat Layout Structure

The `seatLayout` JSON field stores flexible seat configurations:

### **Standard 2x2 Layout (60 seats)**
```json
{
  "layout": "2x2",
  "rows": 15,
  "columns": 4,
  "seats": [
    {"row": 1, "col": 1, "seatNo": "A1", "type": "window"},
    {"row": 1, "col": 2, "seatNo": "A2", "type": "aisle"},
    {"row": 1, "col": 3, "seatNo": "A3", "type": "aisle"},
    {"row": 1, "col": 4, "seatNo": "A4", "type": "window"}
    // ... more seats
  ],
  "specialSeats": {
    "driver": null,
    "emergency": ["A1", "A2"]
  }
}
```

### **Luxury 2x1 Layout (40 seats)**
```json
{
  "layout": "2x1",
  "rows": 20,
  "columns": 2,
  "seats": [
    {"row": 1, "col": 1, "seatNo": "A1", "type": "window"},
    {"row": 1, "col": 2, "seatNo": "A2", "type": "window"}
    // ... more seats
  ]
}
```

### **High Capacity 3x2 Layout (72 seats)**
```json
{
  "layout": "3x2",
  "rows": 12,
  "columns": 6,
  "seats": [
    {"row": 1, "col": 1, "seatNo": "A1", "type": "window"},
    {"row": 1, "col": 2, "seatNo": "A2", "type": "aisle"},
    // ... more seats
  ]
}
```

---

## 🔧 Updated Controllers

### **Bus Controller** (`backend/src/controllers/bus.controller.js`)

**Create Bus:**
```javascript
exports.createBus = async (req, res) => {
  const { busNumber, make, model, seatLayout, totalSeats } = req.body;
  
  const bus = await prisma.bus.create({
    data: {
      busNumber,
      make: make || null,
      model: model || null,
      seatLayout: seatLayout || null,
      totalSeats: totalSeats || null,
    },
  });
  
  res.status(201).json(bus);
};
```

**Get Buses:**
- Now includes all new fields (make, model, seatLayout, totalSeats)
- Ordered by ID descending

---

### **Booking Controller** (`backend/src/controllers/booking.controller.js`)

**Book Seat:**
```javascript
exports.bookSeat = async (req, res) => {
  const userId = req.user.userId; // From JWT
  const { seatId, scheduleId, passengerName, phoneNumber } = req.body;
  
  // Get user info for fallback
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true },
  });
  
  const booking = await prisma.booking.create({
    data: {
      userId,
      seatId,
      scheduleId,
      passengerName: passengerName || user.name, // Use provided or user's name
      phoneNumber: phoneNumber || user.phone || null,
    },
    include: {
      seat: { select: { seatNo: true } },
      schedule: {
        include: {
          route: true,
          bus: { select: { id: true, busNumber: true, make: true, model: true } },
        },
      },
    },
  });
  
  res.status(201).json({
    message: "Booking created successfully",
    booking: {
      id: booking.id,
      bookingId: booking.bookingId, // Unique UUID
      passengerName: booking.passengerName,
      phoneNumber: booking.phoneNumber,
      // ... other fields
    },
  });
};
```

**Features:**
- ✅ Accepts `passengerName` and `phoneNumber` from request
- ✅ Falls back to user's name/phone if not provided
- ✅ Returns `bookingId` (UUID) for user reference
- ✅ Includes bus make/model in response

---

## 📝 Updated Seed File

The seed file (`backend/prisma/seed.js`) now includes:

1. **Three Bus Types:**
   - Standard Bus (NB-1001) - 2x2 layout, 60 seats
   - Luxury Bus (NB-2001) - 2x1 layout, 40 seats
   - High Capacity Bus (NB-3001) - 3x2 layout, 72 seats

2. **Multiple Routes:**
   - Colombo → Kandy
   - Colombo → Galle
   - Kandy → Nuwara Eliya

3. **Multiple Schedules:**
   - Various dates and times
   - Different bus types assigned to routes

**To run seed:**
```bash
cd backend
npx prisma db seed
```

---

## 🗄️ Migration Details

**Migration:** `20260109200000_enhance_bus_and_booking_models`

**Changes:**
1. Added `make`, `model`, `seatLayout` (JSONB), `totalSeats` to `Bus` table
2. Added `bookingId` (UUID with default), `passengerName`, `phoneNumber` to `Booking` table
3. Populated existing bookings with:
   - `bookingId` using `gen_random_uuid()`
   - `passengerName` from User table
   - `phoneNumber` from User table (if available)

**Migration handles existing data:**
- Existing bookings get UUIDs generated automatically
- Passenger names copied from user names
- Phone numbers copied from user phones (if available)

---

## 🎯 API Changes

### **Create Bus** (`POST /api/admin/buses`)

**Request:**
```json
{
  "busNumber": "NB-1001",
  "make": "Ashok Leyland",
  "model": "Viking",
  "seatLayout": {
    "layout": "2x2",
    "rows": 15,
    "columns": 4,
    "seats": [...]
  },
  "totalSeats": 60
}
```

**Response:**
```json
{
  "id": 1,
  "busNumber": "NB-1001",
  "make": "Ashok Leyland",
  "model": "Viking",
  "seatLayout": {...},
  "totalSeats": 60,
  "seats": [...]
}
```

---

### **Book Seat** (`POST /api/user/bookings`)

**Request:**
```json
{
  "seatId": 5,
  "scheduleId": 10,
  "passengerName": "John Doe",  // Optional - uses user name if not provided
  "phoneNumber": "+94771234567"  // Optional - uses user phone if not provided
}
```

**Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "bookingId": "550e8400-e29b-41d4-a716-446655440000", // UUID
    "passengerName": "John Doe",
    "phoneNumber": "+94771234567",
    "seat": {
      "seatNo": "A1"
    },
    "schedule": {
      "date": "2026-01-15T00:00:00.000Z",
      "time": "08:00 AM",
      "route": {
        "from": "Colombo",
        "to": "Kandy"
      },
      "bus": {
        "id": 1,
        "busNumber": "NB-1001",
        "make": "Ashok Leyland",
        "model": "Viking"
      }
    },
    "status": "CONFIRMED",
    "createdAt": "2026-01-09T20:00:00.000Z"
  }
}
```

---

## ✅ Benefits

1. **Flexible Seat Layouts**
   - Support different bus configurations (2x2, 2x1, 3x2)
   - JSON storage allows easy extension
   - Frontend can render seats dynamically based on layout

2. **Better Booking Management**
   - Unique `bookingId` (UUID) for easy reference
   - Passenger details separate from user account
   - Allows booking for others

3. **Bus Information**
   - Make/model for bus identification
   - Total seats for capacity management
   - Seat layout for frontend rendering

4. **Backward Compatible**
   - All new fields are optional
   - Existing data migrated automatically
   - No breaking changes to API

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Render seat layouts dynamically based on `seatLayout` JSON
   - Display bus make/model in UI
   - Show `bookingId` to users for reference

2. **Additional Features:**
   - Seat type highlighting (window, aisle, emergency)
   - Bus type filtering
   - Capacity management

3. **Validation:**
   - Validate seat layout structure
   - Ensure totalSeats matches actual seats
   - Validate passenger details

---

**Status:** ✅ Complete and Ready for Use!
