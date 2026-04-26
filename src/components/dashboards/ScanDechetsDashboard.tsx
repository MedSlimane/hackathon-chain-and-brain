import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import {
  calculateCarbonSaved,
  classifyBiomassFromText,
  predictBiomassPrice,
} from "@/lib/predictions"

interface ScanResult {
  biomassType: string
  estimatedPricePerKg: number
  estimatedTotalPrice: number
  carbonSavedKg: number
  recommendation: string
}

function formatMoney(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

export default function ScanDechetsDashboard() {
  const [description, setDescription] = useState("")
  const [quantity, setQuantity] = useState("100")
  const [location, setLocation] = useState("Farm site")
  const [moisture, setMoisture] = useState("18")
  const [photoName, setPhotoName] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)

  const biomassType = useMemo(
    () => classifyBiomassFromText(description),
    [description]
  )
  const quantityKg = Number(quantity) || 0
  const moistureLevel = Number(moisture) || 0

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    setPhotoName(file?.name ?? "")
  }

  function handleScan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    const prediction = predictBiomassPrice({
      biomassType,
      quantityKg,
      location,
      demandLevel: "medium",
      qualityScore: 72,
      moistureLevel,
      distanceKm: 30,
    })

    window.setTimeout(() => {
      setResult({
        biomassType,
        estimatedPricePerKg: prediction.predictedPricePerKg,
        estimatedTotalPrice: prediction.predictedPricePerKg * quantityKg,
        carbonSavedKg: calculateCarbonSaved(quantityKg, biomassType),
        recommendation:
          moistureLevel > 30
            ? "Dry the biomass further before sale to improve value."
            : "This waste stream is ready for reuse or composting. Share it with local buyers.",
      })
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-emerald-700 uppercase">
              Scan déchets
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">
              Détectez, classez et valorisez vos déchets agricoles.
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Utilisez cette interface pour analyser un lot de déchets, estimer
              sa valeur et obtenir une recommandation de valorisation.
            </p>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Rapide et pratique</p>
            <p className="mt-1">
              Chargez une photo ou décrivez le lot, puis cliquez sur Scanner.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleScan}
        className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Description du lot
              </span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Fanes de blé, paille, résidus de palmiers..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Quantité (kg)
              </span>
              <input
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                type="number"
                min="0"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Localisation
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Teneur en humidité (%)
              </span>
              <input
                value={moisture}
                onChange={(event) => setMoisture(event.target.value)}
                type="number"
                min="0"
                max="100"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Photo du lot
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm text-slate-900 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-slate-700"
              />
              {photoName ? (
                <p className="mt-2 text-xs text-slate-500">
                  Fichier : {photoName}
                </p>
              ) : null}
            </label>
            <div className="flex items-end justify-between rounded-2xl bg-slate-50 p-4">
              <div>
                <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
                  Type détecté
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {biomassType}
                </p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Analyse en cours..." : "Scanner"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold tracking-[0.3em] text-slate-500 uppercase">
              Résultats
            </p>
            {result ? (
              <div className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
                      Type estimé
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {result.biomassType}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
                      Prix estimé /kg
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {formatMoney(result.estimatedPricePerKg)}
                    </p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
                    Prix total estimé
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatMoney(result.estimatedTotalPrice)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
                    Impact carbone évité
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {result.carbonSavedKg.toLocaleString()} kg CO₂
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-xs tracking-[0.3em] text-emerald-700 uppercase">
                    Recommandation
                  </p>
                  <p className="mt-2 text-sm font-medium text-emerald-900">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-slate-600">
                Entrez les détails du lot de déchets, chargez une image
                (facultatif) et cliquez sur Scanner pour obtenir une estimation
                instantanée.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs tracking-[0.3em] text-slate-500 uppercase">
              Autres actions
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Voir les offres de marché pour valoriser le lot.</li>
              <li>Enregistrer une nouvelle annonce de biomasse.</li>
              <li>Comparer les prix selon le type de déchets.</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  )
}
