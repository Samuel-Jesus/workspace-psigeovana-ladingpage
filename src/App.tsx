import { Hero } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { WaveDivider } from './components/WaveDivider'

function App() {
  return (
    <>
      <main>
        <Hero />
        {/* Cream → Plum-200 */}
        <WaveDivider bgColor="#faf7f4" fillColor="#28142e" variant={1} />
        <About />
        {/* Plum-200 → Cream */}
        <WaveDivider bgColor="#28142e" fillColor="#faf7f4" variant={2} />
        <Services />
        {/* Cream → Plum-100 */}
        <WaveDivider bgColor="#faf7f4" fillColor="#3a1e42" variant={3} />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
