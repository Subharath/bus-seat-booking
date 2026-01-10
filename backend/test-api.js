/**
 * API Testing Script
 * Run with: node test-api.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let accessToken = '';
let refreshToken = '';
let userId = null;
let adminToken = '';

// Helper function to print test results
function printTest(name, status, data = null, error = null) {
  const statusColor = status === 'PASS' ? colors.green : colors.red;
  const statusText = status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  
  console.log(`${statusColor}${statusText}${colors.reset} - ${name}`);
  
  if (data && status === 'PASS') {
    console.log(`${colors.cyan}   Response:${colors.reset}`, JSON.stringify(data, null, 2).substring(0, 200));
  }
  
  if (error) {
    console.log(`${colors.red}   Error:${colors.reset}`, error.message || error);
  }
  
  console.log('');
}

// Test functions
async function testHealthCheck() {
  try {
    const response = await axios.get('http://localhost:5000/');
    printTest('Health Check', 'PASS', response.data);
    return true;
  } catch (error) {
    printTest('Health Check', 'FAIL', null, error);
    return false;
  }
}

async function testRegister() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123',
      phone: '+94771234567',
    });
    
    accessToken = response.data.accessToken;
    refreshToken = response.data.refreshToken;
    userId = response.data.user.id;
    
    printTest('User Registration', 'PASS', {
      userId: response.data.user.id,
      email: response.data.user.email,
      hasToken: !!accessToken,
    });
    return true;
  } catch (error) {
    printTest('User Registration', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testLogin() {
  try {
    // First, register a user
    await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Login Test User',
      email: `logintest${Date.now()}@example.com`,
      password: 'TestPass123',
    });
    
    // Then login
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: `logintest${Date.now() - 1000}@example.com`, // Use the email we just registered
      password: 'TestPass123',
    });
    
    printTest('User Login', 'PASS', {
      hasToken: !!response.data.accessToken,
      user: response.data.user.email,
    });
    return true;
  } catch (error) {
    printTest('User Login', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testGetMe() {
  try {
    if (!accessToken) {
      printTest('Get Current User', 'SKIP', null, { message: 'No token available' });
      return false;
    }
    
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    printTest('Get Current User', 'PASS', {
      userId: response.data.user.id,
      email: response.data.user.email,
      bookingsCount: response.data.user.bookings?.length || 0,
    });
    return true;
  } catch (error) {
    printTest('Get Current User', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testGetRoutes() {
  try {
    const response = await axios.get(`${BASE_URL}/user/routes`);
    
    printTest('Get All Routes', 'PASS', {
      routesCount: response.data.length,
      routes: response.data.map(r => `${r.from} → ${r.to}`),
    });
    return true;
  } catch (error) {
    printTest('Get All Routes', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testGetSchedules() {
  try {
    // First get routes
    const routesResponse = await axios.get(`${BASE_URL}/user/routes`);
    if (routesResponse.data.length === 0) {
      printTest('Get Schedules by Route', 'SKIP', null, { message: 'No routes available' });
      return false;
    }
    
    const routeId = routesResponse.data[0].id;
    const response = await axios.get(`${BASE_URL}/user/routes/${routeId}/schedules`);
    
    printTest('Get Schedules by Route', 'PASS', {
      routeId,
      schedulesCount: response.data.length,
    });
    return true;
  } catch (error) {
    printTest('Get Schedules by Route', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testGetAvailableSeats() {
  try {
    // Get a schedule first
    const routesResponse = await axios.get(`${BASE_URL}/user/routes`);
    if (routesResponse.data.length === 0) {
      printTest('Get Available Seats', 'SKIP', null, { message: 'No routes available' });
      return false;
    }
    
    const schedulesResponse = await axios.get(`${BASE_URL}/user/routes/${routesResponse.data[0].id}/schedules`);
    if (schedulesResponse.data.length === 0) {
      printTest('Get Available Seats', 'SKIP', null, { message: 'No schedules available' });
      return false;
    }
    
    const scheduleId = schedulesResponse.data[0].id;
    const response = await axios.get(`${BASE_URL}/user/schedules/${scheduleId}/seats`);
    
    printTest('Get Available Seats', 'PASS', {
      scheduleId,
      availableSeatsCount: response.data.length,
      sampleSeats: response.data.slice(0, 5).map(s => s.seatNo),
    });
    return true;
  } catch (error) {
    printTest('Get Available Seats', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testBookSeat() {
  try {
    if (!accessToken) {
      printTest('Book Seat', 'SKIP', null, { message: 'No token available' });
      return false;
    }
    
    // Get available seats first
    const routesResponse = await axios.get(`${BASE_URL}/user/routes`);
    if (routesResponse.data.length === 0) {
      printTest('Book Seat', 'SKIP', null, { message: 'No routes available' });
      return false;
    }
    
    const schedulesResponse = await axios.get(`${BASE_URL}/user/routes/${routesResponse.data[0].id}/schedules`);
    if (schedulesResponse.data.length === 0) {
      printTest('Book Seat', 'SKIP', null, { message: 'No schedules available' });
      return false;
    }
    
    const scheduleId = schedulesResponse.data[0].id;
    const seatsResponse = await axios.get(`${BASE_URL}/user/schedules/${scheduleId}/seats`);
    
    if (seatsResponse.data.length === 0) {
      printTest('Book Seat', 'SKIP', null, { message: 'No available seats' });
      return false;
    }
    
    const seatId = seatsResponse.data[0].id;
    const response = await axios.post(
      `${BASE_URL}/user/bookings`,
      {
        seatId,
        scheduleId,
        passengerName: 'Test Passenger',
        phoneNumber: '+94771234567',
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    printTest('Book Seat', 'PASS', {
      bookingId: response.data.booking.bookingId,
      passengerName: response.data.booking.passengerName,
      seatNo: response.data.booking.seat.seatNo,
    });
    return true;
  } catch (error) {
    printTest('Book Seat', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testGetBuses() {
  try {
    if (!adminToken) {
      printTest('Get All Buses (Admin)', 'SKIP', null, { message: 'No admin token available' });
      return false;
    }
    
    const response = await axios.get(`${BASE_URL}/admin/buses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    
    printTest('Get All Buses (Admin)', 'PASS', {
      busesCount: response.data.length,
      buses: response.data.map(b => ({
        number: b.busNumber,
        make: b.make,
        model: b.model,
        totalSeats: b.totalSeats,
      })),
    });
    return true;
  } catch (error) {
    printTest('Get All Buses (Admin)', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

async function testCreateBus() {
  try {
    if (!adminToken) {
      printTest('Create Bus (Admin)', 'SKIP', null, { message: 'No admin token available' });
      return false;
    }
    
    const response = await axios.post(
      `${BASE_URL}/admin/buses`,
      {
        busNumber: `TEST-${Date.now()}`,
        make: 'Test Make',
        model: 'Test Model',
        totalSeats: 50,
        seatLayout: {
          layout: '2x2',
          rows: 12,
          columns: 4,
        },
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    
    printTest('Create Bus (Admin)', 'PASS', {
      busId: response.data.id,
      busNumber: response.data.busNumber,
    });
    return true;
  } catch (error) {
    printTest('Create Bus (Admin)', 'FAIL', null, error.response?.data || error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}           API Endpoint Testing${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
  };
  
  // Public endpoints
  console.log(`${colors.yellow}📋 Testing Public Endpoints${colors.reset}\n`);
  
  if (await testHealthCheck()) results.passed++; else results.failed++;
  if (await testRegister()) results.passed++; else results.failed++;
  if (await testLogin()) results.passed++; else results.failed++;
  if (await testGetRoutes()) results.passed++; else results.failed++;
  if (await testGetSchedules()) results.passed++; else results.failed++;
  if (await testGetAvailableSeats()) results.passed++; else results.failed++;
  
  // Protected endpoints
  console.log(`${colors.yellow}🔒 Testing Protected Endpoints${colors.reset}\n`);
  
  if (await testGetMe()) results.passed++; else results.failed++;
  if (await testBookSeat()) results.passed++; else results.failed++;
  
  // Admin endpoints (skip if no admin token)
  console.log(`${colors.yellow}👑 Testing Admin Endpoints${colors.reset}\n`);
  
  const adminTest = await testGetBuses();
  if (adminTest) results.passed++;
  else if (!adminToken) results.skipped++;
  else results.failed++;
  
  const createBusTest = await testCreateBus();
  if (createBusTest) results.passed++;
  else if (!adminToken) results.skipped++;
  else results.failed++;
  
  // Summary
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}                    Test Summary${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⏭️  Skipped: ${results.skipped}${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
  
  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed. Check the errors above.${colors.reset}\n`);
  }
}

// Run tests
runTests().catch(console.error);
