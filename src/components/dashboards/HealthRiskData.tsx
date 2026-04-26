import { useEffect, useMemo, useState } from "react";
import { Activity, CloudSun, HeartPulse, TriangleAlert } from "lucide-react";
import Badge from "@/components/common/Badge";
import EmptyState from "@/components/common/EmptyState";
import LoadingState from "@/components/common/LoadingState";
import StatCard from "@/components/common/StatCard";
import { getCurrentProfile } from "@/lib/auth";
import type { HealthIndicator, PollutionReport, Profile } from "@/lib/database.types";
import { getHealthIndicators, getPollutionReports } from "@/lib/health";

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function riskVariant(score: number): "danger" | "warning" | "success" {
  if (score > 65) return "danger";
  if (score > 40) return "warning";
  return "success";
}

function HealthRiskPage({
  reports,
  indicators,
}: {
  reports: PollutionReport[];
  indicators: HealthIndicator[];
}) {
  const riskRows = useMemo(() => {
    const reportsByRegion = new Map<string, PollutionReport[]>();
    reports.forEach((report) => {
      reportsByRegion.set(report.region, [...(reportsByRegion.get(report.region) ?? []), report]);
    });

    return Array.from(reportsByRegion.entries())
      .map(([region, regionalReports]) => {
        const indicator = indicators.find((item) => item.region === region);
        const avgPollution = average(regionalReports.map((report) => report.pollution_level));
        const avgRespiratoryRisk = average(
          regionalReports.map((report) => report.respiratory_risk_score ?? 0)
        );
        const burnedWaste = regionalReports.reduce(
          (sum, report) => sum + report.burned_waste_estimate_kg,
          0
        );
        const healthRisk = indicator?.risk_score ?? avgRespiratoryRisk;
        const combinedRisk = Math.min(
          100,
          Math.round(avgPollution * 0.35 + healthRisk * 0.5 + burnedWaste / 10000)
        );

        return {
          region,
          avgPollution,
          avgRespiratoryRisk,
          burnedWaste,
          respiratoryCases: indicator?.respiratory_cases ?? null,
          vulnerablePopulation: indicator?.vulnerable_population_estimate ?? null,
          combinedRisk,
          reportCount: regionalReports.length,
        };
      })
      .sort((a, b) => b.combinedRisk - a.combinedRisk);
  }, [reports, indicators]);

  const highRiskCount = riskRows.filter((row) => row.combinedRisk > 65).length;
  const averageCombinedRisk = average(riskRows.map((row) => row.combinedRisk));
  const totalVulnerablePopulation = riskRows.reduce(
    (sum, row) => sum + (row.vulnerablePopulation ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="High-risk regions"
          value={highRiskCount}
          icon={<TriangleAlert size={20} />}
        />
        <StatCard
          title="Avg combined risk"
          value={`${averageCombinedRisk}/100`}
          icon={<Activity size={20} />}
        />
        <StatCard
          title="Vulnerable population"
          value={totalVulnerablePopulation.toLocaleString()}
          icon={<HeartPulse size={20} />}
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-semibold text-slate-950">Regional risk map</h2>
          <p className="mt-1 text-sm text-slate-500">
            Ranked by pollution, respiratory risk, health indicators, and waste-burning estimates.
          </p>
        </div>
        {riskRows.length ? (
          <div className="divide-y divide-slate-100">
            {riskRows.map((row) => (
              <div key={row.region} className="grid gap-4 p-4 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-950">{row.region}</p>
                    <Badge variant={riskVariant(row.combinedRisk)}>
                      {row.combinedRisk}/100 combined risk
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                    <span>Pollution {row.avgPollution}/100</span>
                    <span>Respiratory {row.avgRespiratoryRisk}/100</span>
                    <span>Waste {row.burnedWaste.toLocaleString()} kg</span>
                    <span>{row.reportCount} reports</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600"
                      style={{ width: `${row.combinedRisk}%` }}
                    />
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2 lg:min-w-56 lg:grid-cols-1">
                  <span>
                    Respiratory cases:{" "}
                    {row.respiratoryCases === null
                      ? "N/A"
                      : row.respiratoryCases.toLocaleString()}
                  </span>
                  <span>
                    Vulnerable population:{" "}
                    {row.vulnerablePopulation === null
                      ? "N/A"
                      : row.vulnerablePopulation.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              title="No regional risk data"
              description="Add pollution reports to calculate regional risk."
            />
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <CloudSun size={18} className="text-emerald-700" />
          <h2 className="text-lg font-semibold text-slate-950">Monitoring scope</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Health actors only see aggregated environmental and health signals. Farmer lots,
          buyer marketplace activity, and transaction details stay outside this dashboard.
        </p>
      </div>
    </div>
  );
}

export function HealthRiskData() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error("Login required.");
      if (currentProfile.role !== "health_actor" && currentProfile.role !== "admin") {
        throw new Error("Health actor access required.");
      }

      const [pollutionReports, healthIndicators] = await Promise.all([
        getPollutionReports(),
        getHealthIndicators(),
      ]);
      setProfile(currentProfile);
      setReports(pollutionReports);
      setIndicators(healthIndicators);
    }

    load()
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unable to load health risk map.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState label="Loading health risk map" />;
  if (error || !profile) {
    return (
      <EmptyState title="Risk map unavailable" description={error || "Login required."} />
    );
  }

  return <HealthRiskPage reports={reports} indicators={indicators} />;
}

export default HealthRiskData;
