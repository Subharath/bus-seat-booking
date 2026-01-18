# Loading System Documentation

## Overview
The LankaRoute app now has a centralized loading system that provides a smooth, consistent loading experience across all user routes.

## Components

### 1. LoadingScreen Component
Location: `src/components/common/LoadingScreen.jsx`

A beautiful animated loading screen featuring:
- Animated bus emoji with bouncing effect
- Shimmer text animation
- Progress bar with smooth loading animation
- Gradient background
- Fade in/out transitions

### 2. LoadingContext
Location: `src/contexts/LoadingContext.jsx`

Provides global state management for the loading screen.

**API:**
```javascript
const { isLoading, showLoading, hideLoading } = useLoading()

// Show loading with custom message
showLoading('Loading schedules...')

// Hide loading
hideLoading()
```

## Usage

### Basic Usage in Components

```javascript
import { useLoading } from '../contexts/LoadingContext'

const MyComponent = () => {
  const { showLoading, hideLoading } = useLoading()
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    try {
      showLoading('Loading data...')
      const response = await api.getData()
      // Process data
    } catch (error) {
      // Handle error
    } finally {
      hideLoading()
    }
  }
  
  return <div>Your content</div>
}
```

### With Cleanup in useEffect

```javascript
useEffect(() => {
  showLoading('Initializing...')
  const timer = setTimeout(() => hideLoading(), 500)
  
  return () => {
    clearTimeout(timer)
    hideLoading() // Cleanup
  }
}, [])
```

## Features

✨ **Smooth Animations**
- Fade in/out transitions
- Bus hop animation
- Shimmer text effect
- Progress bar animation

🎨 **Customizable**
- Custom loading messages
- Multiple theme variants (minimal, dark)
- CSS variables for easy styling

⚡ **Performance**
- Minimal re-renders
- Uses memoized callbacks
- Global state management

🔧 **Developer Friendly**
- Simple API
- TypeScript ready
- No props drilling

## Pages Using LoadingContext

All major user pages now use the centralized loading system:
- Home (initial page load)
- Routes (fetching routes and schedules)
- ScheduleSelection (loading schedules)
- SeatSelection (loading seats)
- Dashboard (loading user bookings)

## Styling

The loading screen styles are in `src/components/common/LoadingScreen.css`

You can customize:
- Colors (update gradient and accent colors)
- Animation timing (adjust keyframe durations)
- Size (font-size, width, height)
- Variants (minimal, dark theme)

## Migration Notes

**Before:**
```javascript
const [loading, setLoading] = useState(true)

if (loading) {
  return <div>Loading...</div>
}
```

**After:**
```javascript
const { showLoading, hideLoading } = useLoading()

// In async function
showLoading('Custom message')
// ... fetch data
hideLoading()

// No need for loading check - handled globally
```

## Benefits

1. **Consistency**: Same loading experience everywhere
2. **Less Code**: No need to create loading UI in each component
3. **Better UX**: Professional animations and transitions
4. **Maintainability**: Update loading screen once, affects all pages
5. **Flexibility**: Easy to show/hide with custom messages
