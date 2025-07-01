import { notFound } from "next/navigation"
import { funnelsData } from "@/lib/data"
import { FunnelPreviewUltimate } from "@/components/funnel-preview-ultimate"

interface FunnelPreviewPageProps {
  params: {
    id: string
  }
}

export default function FunnelPreviewPage({ params }: FunnelPreviewPageProps) {
  const funnel = funnelsData.find((f) => f.id === params.id)

  if (!funnel) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <FunnelPreviewUltimate funnel={funnel} />
    </div>
  )
}
