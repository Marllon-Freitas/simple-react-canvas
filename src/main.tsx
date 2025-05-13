import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext/ThemeProvider.tsx'
import { CanvasToolsProvider } from './contexts/CanvasToolsContext/CanvasToolsProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CanvasToolsProvider>
        <App />
      </CanvasToolsProvider>
    </ThemeProvider>
  </StrictMode>,
)
