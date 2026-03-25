import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import { SettingsProvider } from './context/SettingsContext'
import HomePage from './pages/HomePage'
import ProjectPage from './pages/ProjectPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 // Keep in memory for 1 hour
    }
  }
})

export default function App(): React.ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <HashRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/project/:templateId" element={<ProjectPage />} />
            </Routes>
          </AppShell>
        </HashRouter>
      </SettingsProvider>
    </QueryClientProvider>
  )
}
