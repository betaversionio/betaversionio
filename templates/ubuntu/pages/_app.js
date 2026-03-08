import 'tailwindcss/tailwind.css'
import '../styles/index.css'
import { PortfolioProvider } from '../lib/portfolio-context'

function MyApp({ Component, pageProps }) {
  return (
    <PortfolioProvider>
      <Component {...pageProps} />
    </PortfolioProvider>
  )
}

export default MyApp
