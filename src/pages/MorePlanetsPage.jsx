import { useMemo, useState } from 'react'
import { useCelestria } from '../store/useCelestria.js'
import MeasurementRow from '../components/data/MeasurementRow.jsx'
import ProvenanceBadge from '../components/data/ProvenanceBadge.jsx'
import { provenanceKey } from '../components/data/provenance.js'
import SearchableSelect from '../components/ui/SearchableSelect.jsx'
import './MorePlanetsPage.css'

const fields = [
  ['Radius', 'radiusEarth', 'R⊕'],
  ['Mass', 'massEarth', 'M⊕'],
  ['Density', 'densityGcc', 'g/cm³'],
  ['Equilibrium temperature', 'eqTempK', 'K'],
  ['Stellar flux', 'insolationEarth', 'S⊕'],
  ['Orbital period', 'periodDays', 'days'],
  ['Semi-major axis', 'semiMajorAxisAU', 'AU'],
  ['Eccentricity', 'eccentricity', ''],
]

function CatalogStatus({ source, count, generatedAt }) {
  const label = source === 'live' ? 'Live NASA archive' : source === 'snapshot' ? 'NASA snapshot fallback' : 'Offline fixtures'
  return (
    <p className="more-planets__status">
      <span className={`more-planets__dot more-planets__dot--${source ?? 'unknown'}`} />
      {label} · {count.toLocaleString()} planets
      {generatedAt && <span> · retrieved {new Date(generatedAt).toLocaleString()}</span>}
    </p>
  )
}

export default function MorePlanetsPage() {
  const status = useCelestria((s) => s.catalogStatus)
  const planets = useCelestria((s) => s.planets)
  const source = useCelestria((s) => s.catalogSource)
  const generatedAt = useCelestria((s) => s.catalogGeneratedAt)
  const [selectedId, setSelectedId] = useState('')
  const selected = useMemo(() => planets.find((planet) => planet.id === selectedId) ?? planets[0], [planets, selectedId])
  const planetOptions = useMemo(
    () => planets.map((planet) => ({ value: planet.id, label: `${planet.name} — ${planet.host}`, searchText: `${planet.name} ${planet.host}` })),
    [planets],
  )

  if (status !== 'ready') {
    return (
      <section className="more-planets">
        <p className="more-planets__eyebrow">NASA EXOPLANET ARCHIVE</p>
        <h1>More planets</h1>
        <p>{status === 'error' ? 'The catalog could not be loaded.' : 'Loading the planet catalog…'}</p>
      </section>
    )
  }

  if (!selected) {
    return (
      <section className="more-planets">
        <p className="more-planets__eyebrow">NASA EXOPLANET ARCHIVE</p>
        <h1>More planets</h1>
        <p>No planets are available.</p>
      </section>
    )
  }

  return (
    <section className="more-planets">
      <p className="more-planets__eyebrow">NASA EXOPLANET ARCHIVE</p>
      <h1>More planets</h1>
      <p className="more-planets__intro">
        Browse the broader NASA catalog without loading a 3D scene. Values are shown exactly when available; missing archive data is
        marked unavailable.
      </p>
      <CatalogStatus source={source} count={planets.length} generatedAt={generatedAt} />

      <SearchableSelect
        className="more-planets__picker"
        label="Select a planet"
        value={selected.id}
        options={planetOptions}
        onChange={setSelectedId}
      />

      <article className="more-planets__card">
        <header className="more-planets__header">
          <div>
            <p className="more-planets__eyebrow">{selected.host}</p>
            <h2>{selected.name}</h2>
          </div>
          <p className="more-planets__note">Data-only view · no artistic 3D model loaded</p>
        </header>

        <div className="more-planets__section">
          <h3>Planet measurements</h3>
          <dl className="more-planets__measurements">
            {fields.map(([label, key, unit]) => (
              <MeasurementRow key={key} label={label} q={selected[key]} unit={unit} />
            ))}
          </dl>
        </div>

        <div className="more-planets__columns">
          <div className="more-planets__section">
            <h3>Orbit and discovery</h3>
            <dl className="more-planets__measurements">
              <MeasurementRow label="Inclination" q={selected.inclinationDeg} unit="°" />
              <MeasurementRow label="Discovery year" q={selected.discovery.year == null ? null : { value: selected.discovery.year, status: 'measured' }} />
            </dl>
            <p className="more-planets__text"><strong>Method:</strong> {selected.discovery.method ?? 'Unavailable'}</p>
            <p className="more-planets__text"><strong>Facility:</strong> {selected.discovery.facility ?? 'Unavailable'}</p>
          </div>
          <div className="more-planets__section">
            <h3>Host star</h3>
            <dl className="more-planets__measurements">
              <MeasurementRow label="Effective temperature" q={selected.star.teff} unit="K" />
              <MeasurementRow label="Radius" q={selected.star.radiusSun} unit="R☉" />
              <MeasurementRow label="Mass" q={selected.star.massSun} unit="M☉" />
              <MeasurementRow label="Luminosity" q={selected.star.lumLog} unit="log₁₀ L☉" />
            </dl>
          </div>
        </div>

        <footer className="more-planets__footer">
          <span>
            Every displayed quantity carries its archive provenance. <ProvenanceBadge kind={provenanceKey(selected.radiusEarth)} />
          </span>
          <span>All planets are artistic impressions when viewed in CELESTRIA’s 3D profile.</span>
        </footer>
      </article>
    </section>
  )
}
