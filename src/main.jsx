import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initThemeSync } from '@/lib/utils'

initThemeSync()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)