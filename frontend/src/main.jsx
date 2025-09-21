// frontend/src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Debug logging
console.log('🚀 Main.jsx loading...');
console.log('React version:', React.version);
console.log('Environment:', import.meta.env.MODE);

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'monospace',
          padding: '20px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '40px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
              ⚠️ Application Error
            </h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              Something went wrong. Check the console for details.
            </p>
            <details style={{ 
              background: 'rgba(0, 0, 0, 0.2)', 
              padding: '15px', 
              borderRadius: '10px',
              marginTop: '20px',
              textAlign: 'left'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details
              </summary>
              <pre style={{ 
                fontSize: '0.8rem', 
                marginTop: '10px',
                overflow: 'auto',
                maxHeight: '200px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '20px',
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '2px solid white',
                borderRadius: '10px',
                color: 'white',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              🔄 Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Get root element
const container = document.getElementById('root');

if (!container) {
  console.error('❌ Root element not found! Make sure you have <div id="root"></div> in your HTML');
  
  // Create error message in body
  document.body.innerHTML = `
    <div style="
      width: 100vw;
      height: 100vh;
      background: #ff6b6b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: monospace;
      font-size: 1.5rem;
      text-align: center;
    ">
      <div>
        <h1>❌ Root Element Missing</h1>
        <p>Cannot find element with id="root"</p>
        <p>Check your index.html file</p>
      </div>
    </div>
  `;
} else {
  console.log('✅ Root element found, creating React app...');
  
  try {
    const root = createRoot(container);
    console.log('✅ React root created');
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log('✅ React app rendered successfully!');
    
    // Hide loading screen
    setTimeout(() => {
      document.body.classList.add('app-loaded');
    }, 500);
    
  } catch (error) {
    console.error('❌ Error creating React app:', error);
    
    container.innerHTML = `
      <div style="
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: monospace;
        padding: 20px;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          text-align: center;
        ">
          <h1 style="font-size: 2rem; margin-bottom: 20px;">❌ Render Error</h1>
          <p style="font-size: 1.1rem; margin-bottom: 20px;">Failed to render React app</p>
          <pre style="
            background: rgba(0, 0, 0, 0.2);
            padding: 15px;
            border-radius: 10px;
            font-size: 0.9rem;
            text-align: left;
            overflow: auto;
          ">${error.message}</pre>
        </div>
      </div>
    `;
  }
}