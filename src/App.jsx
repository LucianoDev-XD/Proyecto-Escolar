import { Routes, Route } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Marquee from './components/Marquee.jsx'
import Home from './pages/home/Home.jsx'
import Encuesta from './pages/encuesta/Encuesta.jsx'
import YaVotaste from "./pages/ya_votaste/YaVotaste.jsx"
import ResultadosPublicos from "./pages/resultados_publicos/Resultados_Publicos.jsx"

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />
      <Marquee />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/encuesta" element={<Encuesta />} />
          <Route path="/ya-votaste" element={<YaVotaste />} />
          <Route path="/resultados" element={<ResultadosPublicos />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App
