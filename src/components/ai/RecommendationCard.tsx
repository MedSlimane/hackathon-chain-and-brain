import { Lightbulb } from "lucide-react";

export function RecommendationCard({ title = "Recommendation", recommendation }: { title?: string; recommendation: string }) {
  return (
    <article className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950">
      <h3 className="flex items-center gap-2 font-semibold"><Lightbulb size={18} /> {title}</h3>
      <p className="mt-2 text-sm">{recommendation}</p>
    </article>
  );
}

export default RecommendationCard;
