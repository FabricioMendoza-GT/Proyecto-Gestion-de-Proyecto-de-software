'use client'
import { useState } from 'react'

type PanelInfo = 'acerca' | 'metodologias' | 'licencia' | null

export default function Footer() {
  const [panelAbierto, setPanelAbierto] = useState<PanelInfo>(null)
  const cerrar = () => setPanelAbierto(null)

  return (
    <>
      {/* ===== MODALES ===== */}
      {panelAbierto && (
        <div
          onClick={cerrar}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'calc(var(--radius) + 4px)',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '85vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >

            {/* ===== PANEL: ACERCA ===== */}
            {panelAbierto === 'acerca' && (
              <>
                <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'oklch(0.93 0.03 250)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.45 0.15 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>Acerca del Panel</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>Grupo 7 · ULEAM · 2026</div>
                    </div>
                  </div>
                  <button onClick={cerrar} style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }} aria-label="Cerrar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {[
                    'Desarrollado como proyecto estudiantil por el Grupo 7 de la Universidad Laica Eloy Alfaro de Manabí (ULEAM).',
                    'Facilita la comprensión y resolución de problemas de transporte mediante métodos matemáticos clásicos de investigación de operaciones.',
                    'Herramienta de uso libre, sin fines de lucro, orientada exclusivamente al ámbito académico.',
                  ].map((texto, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'oklch(0.55 0.20 250)', marginTop: 8, flexShrink: 0 }} />
                      <p style={{ fontSize: 14, color: 'var(--muted-foreground)', lineHeight: 1.65, margin: 0 }}>{texto}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={cerrar} className="btn btn-secondary">Cerrar</button>
                </div>
              </>
            )}

            {/* ===== PANEL: METODOLOGÍAS ===== */}
            {panelAbierto === 'metodologias' && (
              <>
                <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'oklch(0.93 0.03 250)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.45 0.15 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>Metodologías implementadas</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>3 métodos de resolución disponibles</div>
                    </div>
                  </div>
                  <button onClick={cerrar} style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }} aria-label="Cerrar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                  {[
                    { nombre: 'Esquina Noroeste', badge: 'Básico', badgeBg: 'oklch(0.93 0.03 250)', badgeColor: 'oklch(0.35 0.15 250)', desc: 'Asigna desde la celda superior izquierda, avanzando derecha y abajo hasta satisfacer todas las ofertas y demandas. El más simple, pero no garantiza el costo mínimo.' },
                    { nombre: 'Costo Mínimo', badge: 'Intermedio', badgeBg: 'oklch(0.93 0.03 250)', badgeColor: 'oklch(0.35 0.15 250)', desc: 'Asigna primero a la celda con menor costo de transporte disponible. Produce mejores resultados que Esquina Noroeste en la mayoría de los casos.' },
                    { nombre: 'Aproximación de Vogel', badge: 'Óptimo', badgeBg: 'oklch(0.93 0.05 145)', badgeColor: 'oklch(0.35 0.12 145)', desc: 'Calcula penalizaciones por fila y columna, asignando primero donde la penalización es mayor. La solución inicial más cercana al óptimo.' },
                  ].map((m, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.20 250)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--foreground)' }}>{m.nombre}</span>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: m.badgeBg, color: m.badgeColor, fontWeight: 500 }}>{m.badge}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={cerrar} className="btn btn-secondary">Cerrar</button>
                </div>
              </>
            )}

            {/* ===== PANEL: LICENCIA ===== */}
            {panelAbierto === 'licencia' && (
              <>
                <div style={{ padding: '1.5rem 1.75rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'oklch(0.93 0.03 250)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="oklch(0.45 0.15 250)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)' }}>Licencia y uso académico</div>
                      <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 3 }}>Uso libre con fines educativos</div>
                    </div>
                  </div>
                  <button onClick={cerrar} style={{ width: 28, height: 28, borderRadius: 'var(--radius)', background: 'var(--muted)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }} aria-label="Cerrar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Tipo', value: 'Académico' },
                      { label: 'Institución', value: 'ULEAM' },
                      { label: 'Uso comercial', value: 'No permitido', danger: true },
                      { label: 'Año', value: '2026' },
                    ].map((item, i) => (
                      <div key={i} style={{ background: 'var(--muted)', borderRadius: 'var(--radius)', padding: '.75rem 1rem' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: item.danger ? 'oklch(0.55 0.22 25)' : 'var(--foreground)' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.65, margin: 0 }}>
                    Se permite el uso, modificación y distribución siempre que se mantenga la atribución al <strong>Grupo 7 · ULEAM</strong>. Queda prohibida su comercialización sin autorización expresa de los autores.
                  </p>
                </div>
                <div style={{ padding: '1rem 1.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={cerrar} className="btn btn-secondary">Cerrar</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="site-footer">
        <div className="site-footer__grid">
          <div>
            <h3>Sobre</h3>
            <ul>
              <li>Grupo 7</li>
              <li>Sin Fines de Lucro</li>
              <li>Proyecto Estudiantil</li>
            </ul>
          </div>

          <div>
            <h3>Sobre el sistema</h3>
            <ul>
              <li>Herramienta académica para resolver problemas de transporte.</li>
              <li><button className="site-footer__link-btn" onClick={() => setPanelAbierto('acerca')}>Acerca del Panel</button></li>
              <li><button className="site-footer__link-btn" onClick={() => setPanelAbierto('metodologias')}>Metodologías implementadas</button></li>
              <li><button className="site-footer__link-btn" onClick={() => setPanelAbierto('licencia')}>Licencia y uso académico</button></li>
            </ul>
          </div>

          <div>
            <h3>Funcionalidades</h3>
            <ul>
              <li><a href="/#tabla">Esquina Noroeste</a></li>
              <li><a href="/#tabla">Costo Mínimo</a></li>
              <li><a href="/#tabla">Aproximación de Vogel</a></li>
              <li><a href="/#metodo">Comparación de Métodos</a></li>
              <li><a href="/#historial-btn">Panel de Historial</a></li>
              <li><a href="/#metodo">Panel de Comparación</a></li>
            </ul>
          </div>

          <div>
            <h3>Colaboradores</h3>
            <ul>
              <li>Fabricio Mendoza</li>
              <li>Carmen Valeriano</li>
              <li>Amelia Salvatierra</li>
              <li>Damarys Mero</li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© 2026 — Panel de Cálculo de Transporte · ULEAM</p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <a href="#">Privacidad</a>
            <span>·</span>
            <a href="#">Mapa del Sitio</a>
          </div>
        </div>
      </footer>
    </>
  )
}