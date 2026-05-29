import type { Metadata } from 'next'
import { TOOLS } from '@/lib/constants'
import { getToolMetadata, getToolJsonLd } from '@/lib/seo'
import type { ToolSlug } from '@/types/tool.types'

interface Props {
  params: { tool: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: { params: { tool: string } }): Promise<Metadata> {
  const tool = TOOLS.find((t) => t.slug === params.tool)
  if (!tool) return { title: 'Tool Not Found' }
  return getToolMetadata(tool)
}

export default function ToolLayout({ children, params }: Props) {
  const tool = TOOLS.find((t) => t.slug === (params.tool as ToolSlug))
  const jsonLd = tool ? getToolJsonLd(tool) : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  )
}
