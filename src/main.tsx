import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext/ThemeProvider.tsx'
import { CanvasToolsProvider } from './contexts/CanvasToolsContext/CanvasToolsProvider.tsx'
import { NodesProvider } from './contexts/NodesContext/NodesProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NodesProvider>
        <CanvasToolsProvider>
          <App />
        </CanvasToolsProvider>
      </NodesProvider>
    </ThemeProvider>
  </StrictMode>,
)
