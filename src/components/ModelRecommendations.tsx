import React, { useState, useEffect } from "react";
import type { ModelPerformanceData } from "./ModelPerformanceChart";

export default function ModelRecommendations() {
  const [data, setData] = useState<ModelPerformanceData | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.BASE_URL}data/model-performance.json`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (!controller.signal.aborted) {
          setData(json);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(error);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  if (!data) return null;
  const planning = data.models.filter((m) => m.recommended === "planning");
  const execution = data.models.filter((m) => m.recommended === "execution");

  return (
    <div className="my-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
      <h3 className="mb-4 text-lg font-semibold">Recommended pairings</h3>

      <div className="space-y-3">
        <div>
          <strong className="font-semibold">Planning:</strong>{" "}
          {planning.length > 0 ? planning.map((m) => m.name).join(", ") : "No recommendations"}
        </div>

        <div>
          <strong className="font-semibold">Execution:</strong>{" "}
          {execution.length > 0 ? execution.map((m) => m.name).join(", ") : "No recommendations"}
        </div>
      </div>

      <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
        Updated automatically based on latest performance data and pricing.
      </p>
    </div>
  );
}
