import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ConsentModal } from '@/pages/Consent'
import { PrivacyPage } from '@/pages/Privacy'
import { PHQ9 } from '@/pages/PHQ9'
import { History } from '@/pages/History'
import { Settings } from '@/pages/Settings'
import { Auth } from '@/pages/Auth'
import { type Locale } from '@/i18n/messages'
import { getLanguage, getRecords } from '@/utils/storage'
import { generatePDF } from '@/utils/pdf'
import './App.css'

type Page = 'phq9' | 'history' | 'settings' | 'privacy' | 'signup'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('phq9')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [locale, setLocale] = useState<Locale>('en')

  useEffect(() => {
    // Load language preference
    const savedLocale = getLanguage() as Locale
    setLocale(savedLocale)
  }, [])

  const handleConsent = () => {
    // Consent handled in modal, reload locale if needed
    const savedLocale = getLanguage() as Locale
    setLocale(savedLocale)
  }

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  const handleExportPDF = async () => {
    try {
      const records = await getRecords();
      // Sort by date descending (newest first)
      const sorted = records.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      generatePDF(sorted, locale);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert(locale === 'en' ? 'Failed to export PDF' : 'I rahua te kaweake PDF');
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'phq9':
        return <PHQ9 locale={locale} />
      case 'history':
        return <History locale={locale} onExportPDF={handleExportPDF} />
      case 'settings':
        return <Settings locale={locale} onLocaleChange={handleLocaleChange} />
      case 'privacy':
        return <PrivacyPage locale={locale} />
      case 'signup':
        return <Auth defaultTab="signup" />
      default:
        return <PHQ9 locale={locale} />
    }
  }

  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen bg-gray-50"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <Auth defaultTab="login" onAuthenticated={()=>setIsAuthenticated(true)} />
      </div>
    )
  }

  return (
    <>
      <ConsentModal locale={locale} onConsent={handleConsent} />
      
      <div 
        className="min-h-screen bg-gray-50"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="app">
          <header className="app-header" role="banner">
            <h1 className="text-gray-800 text-3xl font-bold mb-4">Aroha - Mental Health Support</h1>
            <nav role="navigation" aria-label="Main navigation">
              <div className="w-full flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50/80 backdrop-blur px-2 py-2 ring-1 ring-indigo-100 shadow-sm" role="tablist" aria-label="Section tabs">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('phq9')}
                    className={(currentPage === 'phq9' ? 'bg-indigo-100 text-gray-900 shadow-sm ' : 'text-gray-700 hover:text-gray-900 ') + 'rounded-full px-4 py-2 focus-visible:ring-indigo-400'}
                    aria-current={currentPage === 'phq9' ? 'page' : undefined}
                    role="tab"
                    aria-selected={currentPage === 'phq9'}
                  >
                    <span className="material-symbols-outlined mr-2" aria-hidden>info</span> PHQ-9
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('history')}
                    className={(currentPage === 'history' ? 'bg-indigo-100 text-gray-900 shadow-sm ' : 'text-gray-700 hover:text-gray-900 ') + 'rounded-full px-4 py-2 focus-visible:ring-indigo-400'}
                    aria-current={currentPage === 'history' ? 'page' : undefined}
                    role="tab"
                    aria-selected={currentPage === 'history'}
                  >
                    <span className="material-symbols-outlined mr-2" aria-hidden>description</span> History
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('settings')}
                    className={(currentPage === 'settings' ? 'bg-indigo-100 text-gray-900 shadow-sm ' : 'text-gray-700 hover:text-gray-900 ') + 'rounded-full px-4 py-2 focus-visible:ring-indigo-400'}
                    aria-current={currentPage === 'settings' ? 'page' : undefined}
                    role="tab"
                    aria-selected={currentPage === 'settings'}
                  >
                    <span className="material-symbols-outlined mr-2" aria-hidden>rule</span> Settings
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('privacy')}
                    className={(currentPage === 'privacy' ? 'bg-indigo-100 text-gray-900 shadow-sm ' : 'text-gray-700 hover:text-gray-900 ') + 'rounded-full px-4 py-2 focus-visible:ring-indigo-400'}
                    aria-current={currentPage === 'privacy' ? 'page' : undefined}
                    role="tab"
                    aria-selected={currentPage === 'privacy'}
                  >
                    <span className="material-symbols-outlined mr-2" aria-hidden>vrpano</span> Privacy
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPage('signup')}
                    className={(currentPage === 'signup' ? 'bg-indigo-100 text-gray-900 shadow-sm ' : 'text-gray-700 hover:text-gray-900 ') + 'rounded-full px-4 py-2 focus-visible:ring-indigo-400'}
                    aria-current={currentPage === 'signup' ? 'page' : undefined}
                    role="tab"
                    aria-selected={currentPage === 'signup'}
                  >
                    <span className="material-symbols-outlined mr-2" aria-hidden>person_add</span> Sign up
                  </Button>
                </div>
              </div>
            </nav>
          </header>
          <main id="main-content" className="py-8 px-4" role="main">
            {renderPage()}
          </main>
        </div>
      </div>
    </>
  )
}

export default App
