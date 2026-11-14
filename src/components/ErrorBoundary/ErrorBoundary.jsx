import { Component } from 'react'
import { ErrorEstado } from '../Estado/Estado.jsx'

// Si una pantalla falla al dibujarse, muestra un aviso en lugar de dejar toda la página en blanco.
export default class ErrorBoundary extends Component {
  state = { fallo: false }
  static getDerivedStateFromError() { return { fallo: true } }
  componentDidCatch(error) { console.error('Error en la pantalla:', error) }
  componentDidUpdate(prev) { if (this.state.fallo && prev.clave !== this.props.clave) this.setState({ fallo: false }) }
  render() {
    if (this.state.fallo) {
      return (
        <div className="card">
          <ErrorEstado mensaje="Esta pantalla tuvo un problema. Puedes volver a intentarlo o ir a otra sección del menú." onReintentar={() => this.setState({ fallo: false })} />
        </div>
      )
    }
    return this.props.children
  }
}
