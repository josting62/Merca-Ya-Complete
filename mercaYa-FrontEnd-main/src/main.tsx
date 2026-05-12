import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize:   '13px',
          fontWeight: '600',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 16px rgba(15,28,63,0.12)',
        },
        success: {
          style: {
            background: '#f0fdf4',
            color:      '#15803d',
            border:     '1px solid #bbf7d0',
          },
          iconTheme: { primary: '#16a34a', secondary: '#fff' },
        },
        error: {
          style: {
            background: '#fff1f2',
            color:      '#dc2626',
            border:     '1px solid #fecdd3',
          },
          iconTheme: { primary: '#dc2626', secondary: '#fff' },
          duration: 5000,
        },
      }}
    />
  </StrictMode>,
)