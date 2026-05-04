import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <CartProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '14px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#ecfdf5',
                color: '#166534',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#b91c1c',
              },
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

