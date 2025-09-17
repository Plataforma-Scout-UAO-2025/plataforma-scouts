import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import Auth0ProviderWrapper from './auth/Auth0Provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0ProviderWrapper>
      <App/>
    </Auth0ProviderWrapper>
  </StrictMode>,
)
