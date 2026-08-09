import { Hero } from './components/Hero'
import { About } from './components/About'
import { Themes } from './components/Themes'
import { Services } from './components/Services'
import { Contact } from './components/Contact'
import { Footer } from './components/Footer'
import { WaveDivider } from './components/WaveDivider'

const CREAM = '#efdfbe'
const PLUM = '#39213b'
const PLUM_DEEP = '#28142e'

function App() {
  return (
    <>
      <main>
        <Hero />
        <WaveDivider from={CREAM} to={PLUM} variant="descend" />
        <About />
        {/* About e Themes compartilham o plum — sem divisor */}
        <Themes />
        <WaveDivider from={PLUM} to={CREAM} variant="ascend" />
        <Services />
        <WaveDivider from={CREAM} to={PLUM} variant="ribbon" />
        <Contact />
      </main>
      <WaveDivider from={PLUM} to={PLUM_DEEP} variant="ribbon" />
      <Footer />
    </>
  )
}

export default App
