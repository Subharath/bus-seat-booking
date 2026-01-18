import './LoadingScreen.css'

const LoadingScreen = ({ message = 'LankaRoute' }) => {
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <div className="loading-bus">🚌</div>
        <div className="loading-text">{message}</div>
        <div className="loading-progress">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
