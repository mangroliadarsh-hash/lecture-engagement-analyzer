"use client"

import * as React from "react"
import { useApp } from "@/components/app-provider"
import { PageHeader } from "@/components/shared/page-header"
import { EngagementTimeline } from "@/components/analytics/engagement-timeline"
import { TranscriptReader } from "@/components/analytics/transcript-reader"
import { EvidencePanel } from "@/components/analytics/evidence-panel"
import { Card } from "@/components/ui/card"
import { lectureLabel } from "@/lib/data"

export default function AnalyticsPage() {
  const {
    lecture,
    selectedHotspotId,
    selectedHotspot,
    selectHotspot,
    selectedTimestamp,
    selectTimestamp,
    signalFilter,
    setSignalFilter,
    completedRecommendations,
    toggleRecommendation,
  } = useApp()

  const cluster = React.useMemo(() => {
    if (!selectedHotspot) return null
    return (
      lecture.clusters.find((c) => c.hotspotId === selectedHotspot.id) ?? null
    )
  }, [lecture, selectedHotspot])

  const hotspotRecommendations = React.useMemo(() => {
    if (!selectedHotspot) return []
    return lecture.recommendations.filter(
      (r) => r.hotspotId === selectedHotspot.id,
    )
  }, [lecture, selectedHotspot])

  return (
    <div className="flex flex-col gap-6 pb-12">
      <PageHeader
        eyebrow={lectureLabel(lecture)}
        title="Lecture Analytics"
        description="Interact with timeline signals to isolate friction points, inspect synced transcript passages, and review AI-synthesized teaching evidence."
      />

      {/* Main Interactive Timeline Card */}
      <Card className="p-4 sm:p-6">
        <EngagementTimeline
          timeline={lecture.timeline}
          hotspots={lecture.hotspots}
          durationSec={lecture.durationSec}
          selectedTimestamp={selectedTimestamp}
          selectedHotspotId={selectedHotspotId}
          filter={signalFilter}
          onFilterChange={setSignalFilter}
          onSelectHotspot={selectHotspot}
          onSelectTimestamp={selectTimestamp}
          compact={false}
          showFilters={true}
        />
      </Card>

      {/* Synchronized Dual Pane: Transcript & Evidence Panel */}
      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="flex flex-col gap-3 p-4 sm:p-5 lg:col-span-7">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Interactive Transcript</h3>
              <p className="text-xs text-muted-foreground">
                Click any line or timestamp to correlate teaching delivery with audience signals.
              </p>
            </div>
            {selectedTimestamp !== null && (
              <button
                type="button"
                onClick={() => {
                  selectTimestamp(null)
                  selectHotspot(null)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </button>
            )}
          </div>
          <TranscriptReader
            transcript={lecture.transcript}
            selectedTimestamp={selectedTimestamp}
            selectedHotspotId={selectedHotspotId}
            onSelectTimestamp={selectTimestamp}
            maxHeightClassName="max-h-[38rem]"
          />
        </Card>

        <Card className="flex flex-col p-4 sm:p-5 lg:col-span-5">
          <div className="mb-3 border-b pb-3">
            <h3 className="text-sm font-semibold tracking-tight">Signal & Evidence Inspector</h3>
            <p className="text-xs text-muted-foreground">
              Deep dive into flagged confusion, difficulty score, and student query clusters.
            </p>
          </div>
          <EvidencePanel
            hotspot={selectedHotspot}
            cluster={cluster}
            recommendations={hotspotRecommendations}
            completed={completedRecommendations}
            onToggleRecommendation={toggleRecommendation}
          />
        </Card>
      </div>
    </div>
  )
}
