import { useMemo, useState, type SyntheticEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CloudSun, HeartPulse, Leaf, ScanSearch, Store, Users } from "lucide-react";
import Badge from "@/components/common/Badge";
import StatCard from "@/components/common/StatCard";
import type { BiomassListing, HealthIndicator, PollutionReport } from "@/lib/database.types";
import { createPollutionReport } from "@/lib/health";
import { logSecurityEvent } from "@/lib/security";
import { pollutionReportSchema } from "@/lib/validators";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function riskVariant(score: number): "success" | "warning" | "danger" {
  if (score > 65) return "danger";
  if (score > 40) return "warning";
  return "success";
}

export function HealthDashboard({
  reporterId,
  reports,
  indicators,
  listings,
}: {
  reporterId: string;
  reports: PollutionReport[];
  indicators: HealthIndicator[];
  listings: BiomassListing[];
}) {
  const [collectedReports, setCollectedReports] = useState(reports);
  const [message, setMessage] = useState("");

  const overview = useMemo(() => {
    const regions = new Set<string>();
    collectedReports.forEach((report) => regions.add(report.region));
    indicators.forEach((indicator) => regions.add(indicator.region));
    listings.forEach((listing) => regions.add(listing.location));

    const averagePollution = average(collectedReports.map((report) => report.pollution_level));
    const averageReportRisk = average(
      collectedReports.map((report) => report.respiratory_risk_score ?? 0)
    );
    const averageIndicatorRisk = average(indicators.map((indicator) => indicator.risk_score ?? 0));
    const averageAirQuality = average(
      indicators.map((indicator) => indicator.air_quality_score ?? 0)
    );
    const healthcareScore = average([
      averageAirQuality,
      Math.max(0, 100 - averageIndicatorRisk),
      Math.max(0, 100 - averageReportRisk),
    ]);
    const respiratoryCases = indicators.reduce(
      (sum, indicator) => sum + indicator.respiratory_cases,
      0
    );
    const vulnerablePopulation = indicators.reduce(
      (sum, indicator) => sum + indicator.vulnerable_population_estimate,
      0
    );
    const burnedWaste = collectedReports.reduce(
      (sum, report) => sum + report.burned_waste_estimate_kg,
      0
    );
    const listedQuantity = listings.reduce((sum, listing) => sum + listing.quantity_kg, 0);
    const carbonAvoided = listings.reduce((sum, listing) => sum + listing.carbon_saved_kg, 0);
    const healthReduction = average(
      listings.map((listing) => listing.health_risk_reduction_score)
    );
    const predictedRisk = Math.min(
      100,
      Math.round(averageReportRisk * 0.55 + averageIndicatorRisk * 0.35 + burnedWaste / 75000)
    );

    return {
      averagePollution,
      averageReportRisk,
      averageIndicatorRisk,
      averageAirQuality,
      healthcareScore,
      respiratoryCases,
      vulnerablePopulation,
      burnedWaste,
      listedQuantity,
      carbonAvoided,
      environmentScore: Math.max(0, 100 - averagePollution),
      predictedRisk,
      healthReduction,
      regionsCovered: regions.size,
      availableListings: listings.filter((listing) => listing.status === "available").length,
      listingsWithImages: listings.filter((listing) => Boolean(listing.image_url)).length,
      collectionCount: collectedReports.length + indicators.length + listings.length,
      highRiskRegions: indicators.filter((indicator) => (indicator.risk_score ?? 0) > 65).length,
    };
  }, [collectedReports, indicators, listings]);

  const regionalRows = useMemo(() => {
    const rows = new Map<
      string,
      {
        region: string;
        pollution: number;
        reportRisk: number;
        indicatorRisk: number;
        airQuality: number;
        respiratoryCases: number;
        vulnerablePopulation: number;
        listings: number;
      }
    >();

    collectedReports.forEach((report) => {
      const current = rows.get(report.region) ?? {
        region: report.region,
        pollution: 0,
        reportRisk: 0,
        indicatorRisk: 0,
        airQuality: 0,
        respiratoryCases: 0,
        vulnerablePopulation: 0,
        listings: 0,
      };
      current.pollution = Math.max(current.pollution, report.pollution_level);
      current.reportRisk = Math.max(current.reportRisk, report.respiratory_risk_score ?? 0);
      rows.set(report.region, current);
    });

    indicators.forEach((indicator) => {
      const current = rows.get(indicator.region) ?? {
        region: indicator.region,
        pollution: 0,
        reportRisk: 0,
        indicatorRisk: 0,
        airQuality: 0,
        respiratoryCases: 0,
        vulnerablePopulation: 0,
        listings: 0,
      };
      current.indicatorRisk = Math.max(current.indicatorRisk, indicator.risk_score ?? 0);
      current.airQuality = Math.max(current.airQuality, indicator.air_quality_score ?? 0);
      current.respiratoryCases += indicator.respiratory_cases;
      current.vulnerablePopulation += indicator.vulnerable_population_estimate;
      rows.set(indicator.region, current);
    });

    listings.forEach((listing) => {
      const current = rows.get(listing.location) ?? {
        region: listing.location,
        pollution: 0,
        reportRisk: 0,
        indicatorRisk: 0,
        airQuality: 0,
        respiratoryCases: 0,
        vulnerablePopulation: 0,
        listings: 0,
      };
      current.listings += 1;
      rows.set(listing.location, current);
    });

    return Array.from(rows.values()).sort(
      (a, b) =>
        Math.max(b.reportRisk, b.indicatorRisk, b.pollution) -
        Math.max(a.reportRisk, a.indicatorRisk, a.pollution)
    );
  }, [collectedReports, indicators, listings]);

  const priorityReports = useMemo(
    () =>
      [...collectedReports]
        .sort((a, b) => (b.respiratory_risk_score ?? 0) - (a.respiratory_risk_score ?? 0))
        .slice(0, 5),
    [collectedReports]
  );

  const priorityListings = useMemo(
    () =>
      [...listings]
        .sort((a, b) => b.health_risk_reduction_score - a.health_risk_reduction_score)
        .slice(0, 4),
    [listings]
  );

  const healthcareScoreRows = useMemo(
    () =>
      regionalRows
        .map((row) => ({
          ...row,
          healthcareScore: average([
            row.airQuality,
            Math.max(0, 100 - row.indicatorRisk),
            Math.max(0, 100 - row.reportRisk),
          ]),
        }))
        .sort((a, b) => a.healthcareScore - b.healthcareScore)
        .slice(0, 6),
    [regionalRows]
  );

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = pollutionReportSchema.safeParse(Object.fromEntries(new FormData(form)));

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check report fields.");
      return;
    }

    try {
      const created = await createPollutionReport(parsed.data, reporterId);
      await logSecurityEvent({
        userId: reporterId,
        eventType: "pollution_report_created",
        details: { region: parsed.data.region },
      });
      setCollectedReports((currentReports) => [created, ...currentReports]);
      setMessage("Regional health signal collected.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save report.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Collected signals"
          value={overview.collectionCount}
          icon={<Activity size={20} />}
          description={`${overview.regionsCovered} regions covered across reports, health indicators, and farmer lots.`}
        />
        <StatCard
          title="Avg pollution"
          value={`${overview.averagePollution}/100`}
          icon={<CloudSun size={20} />}
        />
        <StatCard
          title="Respiratory risk"
          value={`${Math.max(overview.averageReportRisk, overview.averageIndicatorRisk)}/100`}
          icon={<HeartPulse size={20} />}
        />
        <StatCard
          title="Environment score"
          value={`${overview.environmentScore}/100`}
          icon={<Leaf size={20} />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Healthcare score"
          value={`${overview.healthcareScore}/100`}
          icon={<HeartPulse size={20} />}
          description="Air quality, indicator risk, and field report risk combined."
        />
        <StatCard
          title="Air quality score"
          value={`${overview.averageAirQuality}/100`}
          icon={<CloudSun size={20} />}
        />
        <StatCard
          title="Respiratory cases"
          value={overview.respiratoryCases.toLocaleString()}
          icon={<Activity size={20} />}
        />
        <StatCard
          title="Vulnerable population"
          value={overview.vulnerablePopulation.toLocaleString()}
          icon={<Users size={20} />}
        />
        <StatCard
          title="High-risk regions"
          value={overview.highRiskRegions}
          icon={<ScanSearch size={20} />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Farmer lots monitored</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">{listings.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            {overview.availableListings} available, {overview.listingsWithImages} with images
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Biomass quantity tracked</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {overview.listedQuantity.toLocaleString()} kg
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">CO2e avoided from listings</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {overview.carbonAvoided.toLocaleString()} kg
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Predicted public-health risk</p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {overview.predictedRisk}/100
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Regional signals</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalRows}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="pollution" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reportRisk" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Health risk trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indicators}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="risk_score" stroke="#0284c7" strokeWidth={2} />
                <Line
                  type="monotone"
                  dataKey="air_quality_score"
                  stroke="#059669"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Healthcare scores by region</h2>
          <p className="mt-1 text-sm text-slate-500">
            Lower scores need priority intervention. Scores are computed from health indicators,
            air quality, and collected field reports.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Healthcare score</th>
                <th className="px-5 py-3 font-medium">Air quality</th>
                <th className="px-5 py-3 font-medium">Risk score</th>
                <th className="px-5 py-3 font-medium">Respiratory cases</th>
                <th className="px-5 py-3 font-medium">Vulnerable population</th>
              </tr>
            </thead>
            <tbody>
              {healthcareScoreRows.map((row) => (
                <tr key={row.region} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium text-slate-950">{row.region}</td>
                  <td className="px-5 py-3">
                    <Badge variant={riskVariant(100 - row.healthcareScore)}>
                      {row.healthcareScore}/100
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{row.airQuality}/100</td>
                  <td className="px-5 py-3 text-slate-600">
                    {Math.max(row.indicatorRisk, row.reportRisk)}/100
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {row.respiratoryCases.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {row.vulnerablePopulation.toLocaleString()}
                  </td>
                </tr>
              ))}
              {!healthcareScoreRows.length ? (
                <tr>
                  <td className="px-5 py-5 text-slate-500" colSpan={6}>
                    No healthcare score data collected yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Collect regional signal</h2>
          <p className="text-sm leading-6 text-slate-500">
            Add aggregated field data here. It feeds the healthcare overview and risk map.
          </p>
          <input name="region" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Region" required />
          <input name="pollution_level" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Pollution level" required />
          <input name="burned_waste_estimate_kg" type="number" min="0" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Burned waste estimate kg" />
          <input name="respiratory_risk_score" type="number" min="0" max="100" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Respiratory risk score" required />
          <textarea name="notes" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Notes" />
          <button className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">Save signal</button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold text-slate-950">Priority regions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Highest collected respiratory-risk reports.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {priorityReports.map((report) => {
              const riskScore = report.respiratory_risk_score ?? 0;

              return (
                <div key={report.id} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium text-slate-950">{report.region}</p>
                    <p className="text-sm text-slate-500">
                      Pollution {report.pollution_level}/100 - Waste{" "}
                      {report.burned_waste_estimate_kg.toLocaleString()} kg
                    </p>
                    {report.notes ? <p className="mt-1 text-sm text-slate-500">{report.notes}</p> : null}
                  </div>
                  <Badge variant={riskVariant(riskScore)}>{riskScore}/100</Badge>
                </div>
              );
            })}
            {!priorityReports.length ? (
              <div className="p-5 text-sm text-slate-500">No regional reports collected yet.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Farmer lots feeding healthcare scan</h2>
            <p className="mt-1 text-sm text-slate-500">
              Existing Supabase listings used by the waste-scan page.
            </p>
          </div>
          <a
            href="/dashboard/scan-dechets"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ScanSearch size={16} /> Open scan
          </a>
        </div>
        <div className="divide-y divide-slate-100">
          {priorityListings.map((listing) => (
            <div key={listing.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto]">
              <div className="flex min-w-0 gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                  <Store size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-950">{listing.title}</p>
                  <p className="text-sm text-slate-500">
                    {listing.biomass_type} - {listing.location} -{" "}
                    {listing.quantity_kg.toLocaleString()} kg
                  </p>
                </div>
              </div>
              <Badge variant={riskVariant(listing.health_risk_reduction_score)}>
                {listing.health_risk_reduction_score}/100 reduction
              </Badge>
            </div>
          ))}
          {!priorityListings.length ? (
            <div className="p-5 text-sm text-slate-500">No farmer lots available yet.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default HealthDashboard;
