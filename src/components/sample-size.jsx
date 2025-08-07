"use client"

import { Skeleton } from "@/components/ui/skeleton"

export default function SampleSize({ selectedSample, onSampleChange, loading }) {
  return (
    <div className="w-full h-full">
        {loading ? (
            <Skeleton className="h-10 w-full" />
        ) : (
        <input
            type="number"
            className="w-full h-10 px-3 py-2 border rounded-md"
            value={selectedSample ?? ""}
            onChange={e => {
                const val = e.target.value;
                if (val === "" || (/^\d+$/.test(val) && Number.isInteger(Number(val)))) {
                onSampleChange && onSampleChange(val);
                }
            }}
            placeholder="Enter the sample size"
            min={1}
            step={1}
            inputMode="numeric"
            />
        )}
    </div>
  )
}