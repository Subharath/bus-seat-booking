import { createContext, useContext, useState, useCallback } from 'react'
import LoadingScreen from '../components/common/LoadingScreen'

const LoadingContext = createContext(null)

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('LankaRoute')

  const showLoading = useCallback((message = 'LankaRoute') => {
    setLoadingMessage(message)
    setIsLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {isLoading && <LoadingScreen message={loadingMessage} />}
      {children}
    </LoadingContext.Provider>
  )
}
