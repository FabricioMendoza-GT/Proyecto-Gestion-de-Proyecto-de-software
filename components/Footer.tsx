import React from 'react'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-secondary)', color: 'var(--color-secondary-foreground)' }} className="site-footer">
      <div className="site-footer__grid">
        <div>
          <h3>SOBRE</h3>
          <ul>
            <li><a href="#">Grupo 7</a></li>
            <li><a href="#">Sin Fines de Lucro</a></li>
            <li><a href="#">Proyecto Estudiantil</a></li>
          </ul>
        </div>

        <div>
          <h3>SOBRE EL SISTEMA</h3>
          <ul>
            <li>Herramienta académica para resolver problemas de transporte.</li>
            <li><a href="#">Acerca del Panel</a></li>
            <li><a href="#">Metodologías implementadas</a></li>
            <li><a href="#">Licencia y uso académico</a></li>
          </ul>
        </div>

        <div>
          <h3>FUNCIONALIDADES</h3>
          <ul>
            <li><a href="#">Esquina Noroeste</a></li>
            <li><a href="#">Costo Mínimo</a></li>
            <li><a href="#">Aproximación de Vogel</a></li>
            <li><a href="#">Comparación de Métodos</a></li>
            <li><a href="#">Panel de Historial</a></li>
            <li><a href="#">Panel de Comparación</a></li>
          </ul>
        </div>

        <div>
          <h3>COLABORADORES DEL SISTEMA</h3>
          <ul>
            <li>Fabricio "Lider"</li>
            <li>Carmen Annabel Valeriano Delgado</li>
            <li>Amelia Beatriz Salvatierra Vásquez</li>
            <li>Damarys Dayanira Mero Zambrano</li>
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© 2026 — Panel de Cálculo de Transporte · Universidad</p>
        <div className="site-footer__links">
          <a href="#">Privacidad</a>
          <span>·</span>
          <a href="#">Mapa del Sitio</a>
        </div>
      </div>
    </footer>
  )
}
