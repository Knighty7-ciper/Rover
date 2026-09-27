import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function PlatformPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) {
  return <div className="mx-auto max-w-4xl"><div className="mb-8"><p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#ff6a32]">{eyebrow}</p><h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">{description}</p></div>{children}</div>
}

export function FeatureCard({ title, detail, status = "Explore" }: { title: string; detail: string; status?: string }) {
  return <Card className="border-white/[0.08] bg-white/[0.04] text-white transition-colors hover:border-[#ff6a32]/40"><CardHeader className="flex flex-row items-start justify-between gap-3"><CardTitle className="text-base">{title}</CardTitle><Badge variant="secondary" className="bg-white/[0.08] text-white/60">{status}</Badge></CardHeader><CardContent className="text-sm leading-6 text-white/45">{detail}</CardContent></Card>
}

export const platformFeatures = [
  ["Circles", "Find focused communities around the ideas, projects, and disciplines you care about."],
  ["Stories", "Share a quick visual update, behind-the-scenes moment, or daily progress note."],
  ["Rover Notes", "Publish thoughtful long-form writing with a clean reading experience."],
  ["Creator profile", "Turn your profile into a living portfolio with work, posts, and audience signals."],
  ["Projects", "Follow work in progress, milestones, collaborators, and public updates."],
  ["Messages", "Keep conversations, introductions, and collaboration in one calm inbox."],
] as const

export function PlatformFeatureGrid() { return <div className="grid gap-4 sm:grid-cols-2">{platformFeatures.map(([title, detail]) => <FeatureCard key={title} title={title} detail={detail} />)}</div> }

export function AuthenticatedPlatformPage({ children }: { children: ReactNode }) { return <>{children}</> }

export function PlaceholderList({ items }: { items: Array<{ title: string; detail: string; badge?: string }> }) { return <div className="grid gap-4">{items.map((item) => <FeatureCard key={item.title} title={item.title} detail={item.detail} status={item.badge} />)}</div> }

export function HeaderStat({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4"><p className="text-2xl font-black text-white">{value}</p><p className="mt-1 text-xs uppercase tracking-wider text-white/35">{label}</p></div> }

export function ExploreBadge({ children }: { children: ReactNode }) { return <Badge className="rounded-full bg-[#ff6a32]/15 px-3 py-1 text-[#ff9b78] hover:bg-[#ff6a32]/20">{children}</Badge> }

export function platformShellContent() { return null }

export function PlatformCard({ children }: { children: ReactNode }) { return <Card className="border-white/[0.08] bg-white/[0.04] text-white">{children}</Card> }

export function PlatformCardContent({ children }: { children: ReactNode }) { return <CardContent className="p-5">{children}</CardContent> }

export function PlatformCardHeader({ children }: { children: ReactNode }) { return <CardHeader>{children}</CardHeader> }

export function PlatformCardTitle({ children }: { children: ReactNode }) { return <CardTitle className="text-lg text-white">{children}</CardTitle> }

export function PlatformCardDescription({ children }: { children: ReactNode }) { return <p className="text-sm text-white/45">{children}</p> }

export function PlatformCardFooter({ children }: { children: ReactNode }) { return <div className="p-5 pt-0">{children}</div> }

export function PlatformCardBody({ children }: { children: ReactNode }) { return <div className="flex flex-col gap-4">{children}</div> }

export function PlatformGrid({ children }: { children: ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2">{children}</div> }

export function PlatformSection({ children }: { children: ReactNode }) { return <section className="mb-8">{children}</section> }

export function PlatformSectionTitle({ children }: { children: ReactNode }) { return <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-white/40">{children}</h2> }

export function PlatformMetricRow({ children }: { children: ReactNode }) { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div> }

export function PlatformMetric({ label, value }: { label: string; value: string }) { return <HeaderStat label={label} value={value} /> }

export function PlatformEmpty({ title, detail }: { title: string; detail: string }) { return <Card className="border-dashed border-white/15 bg-transparent p-8 text-center"><p className="font-semibold text-white">{title}</p><p className="mt-2 text-sm text-white/45">{detail}</p></Card> }

export function PlatformLinkCard({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} status="Open" /> }

export function PlatformPill({ children }: { children: ReactNode }) { return <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">{children}</span> }

export function PlatformPills({ children }: { children: ReactNode }) { return <div className="flex flex-wrap gap-2">{children}</div> }

export function PlatformDivider() { return <div className="h-px bg-white/[0.08]" /> }

export function PlatformIntro({ title, detail }: { title: string; detail: string }) { return <div className="rounded-3xl border border-[#ff6a32]/25 bg-gradient-to-br from-[#ff6a32]/15 to-transparent p-6"><h2 className="text-xl font-bold text-white">{title}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">{detail}</p></div> }

export function PlatformList({ children }: { children: ReactNode }) { return <div className="flex flex-col gap-3">{children}</div> }

export function PlatformListItem({ title, detail }: { title: string; detail: string }) { return <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"><div><p className="font-semibold text-white">{title}</p><p className="mt-1 text-sm text-white/40">{detail}</p></div><span className="text-[#ff6a32]">→</span></div> }

export function PlatformNavNote() { return <p className="mt-8 text-center text-xs text-white/30">Rover is your place to discover, publish, collaborate, and belong.</p> }

export function PlatformContent({ children }: { children: ReactNode }) { return <div className="flex flex-col gap-6">{children}</div> }

export function PlatformCallout({ children }: { children: ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/55">{children}</div> }

export function PlatformLabel({ children }: { children: ReactNode }) { return <p className="text-xs font-semibold uppercase tracking-widest text-white/35">{children}</p> }

export function PlatformTitle({ children }: { children: ReactNode }) { return <h3 className="text-lg font-bold text-white">{children}</h3> }

export function PlatformText({ children }: { children: ReactNode }) { return <p className="text-sm leading-6 text-white/50">{children}</p> }

export function PlatformRow({ children }: { children: ReactNode }) { return <div className="flex flex-wrap items-center gap-3">{children}</div> }

export function PlatformSpacer() { return <div className="h-2" /> }

export function PlatformButtonLabel({ children }: { children: ReactNode }) { return <span>{children}</span> }

export function PlatformRouteNote({ children }: { children: ReactNode }) { return <div className="mt-6 text-xs text-white/30">{children}</div> }

export function PlatformAccent({ children }: { children: ReactNode }) { return <span className="text-[#ff6a32]">{children}</span> }

export function PlatformAction({ children }: { children: ReactNode }) { return <div className="rounded-xl bg-[#ff6a32] px-4 py-2 text-center text-sm font-bold text-white">{children}</div> }

export function PlatformSectionCopy({ children }: { children: ReactNode }) { return <p className="mb-4 text-sm text-white/45">{children}</p> }

export function PlatformMeta({ children }: { children: ReactNode }) { return <span className="text-xs text-white/35">{children}</span> }

export function PlatformCardList({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformList>{items.map((item) => <PlatformListItem key={item.title} {...item} />)}</PlatformList> }

export function PlatformFeature({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformRoute({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) { return <PlatformPage eyebrow={eyebrow} title={title} description={description}>{children}</PlatformPage> }

export function PlatformShell({ children }: { children: ReactNode }) { return <div className="min-h-[60vh]">{children}</div> }

export function PlatformSurface({ children }: { children: ReactNode }) { return <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5">{children}</div> }

export function PlatformStats({ children }: { children: ReactNode }) { return <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div> }

export function PlatformFootnote({ children }: { children: ReactNode }) { return <p className="text-xs text-white/30">{children}</p> }

export function PlatformGridItem({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformOverview({ children }: { children: ReactNode }) { return <div className="flex flex-col gap-5">{children}</div> }

export function PlatformCopy({ children }: { children: ReactNode }) { return <p className="text-sm leading-6 text-white/50">{children}</p> }

export function PlatformHeading({ children }: { children: ReactNode }) { return <h2 className="text-2xl font-bold text-white">{children}</h2> }

export function PlatformTag({ children }: { children: ReactNode }) { return <Badge variant="outline" className="border-white/10 text-white/50">{children}</Badge> }

export function PlatformTags({ children }: { children: ReactNode }) { return <div className="flex flex-wrap gap-2">{children}</div> }

export function PlatformRouteGrid({ children }: { children: ReactNode }) { return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div> }

export function PlatformRouteTile({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} status="Live" /> }

export function PlatformRouteTiles({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformRouteGrid>{items.map((item) => <PlatformRouteTile key={item.title} {...item} />)}</PlatformRouteGrid> }

export function PlatformSummary({ title, detail }: { title: string; detail: string }) { return <PlatformIntro title={title} detail={detail} /> }

export function PlatformSummaryGrid({ children }: { children: ReactNode }) { return <PlatformGrid>{children}</PlatformGrid> }

export function PlatformSummaryCard({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} status="Rover" /> }

export function PlatformRouteHeader({ children }: { children: ReactNode }) { return <div className="mb-6">{children}</div> }

export function PlatformRouteBody({ children }: { children: ReactNode }) { return <div>{children}</div> }

export function PlatformRouteFooter({ children }: { children: ReactNode }) { return <div className="mt-8">{children}</div> }

export function PlatformRouteCard({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformRouteCards({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformGrid>{items.map((item) => <PlatformRouteCard key={item.title} {...item} />)}</PlatformGrid> }

export function PlatformRouteSection({ children }: { children: ReactNode }) { return <section>{children}</section> }

export function PlatformRouteSectionTitle({ children }: { children: ReactNode }) { return <h2 className="mb-4 text-lg font-bold text-white">{children}</h2> }

export function PlatformRouteSectionText({ children }: { children: ReactNode }) { return <p className="mb-5 text-sm text-white/45">{children}</p> }

export function PlatformRouteMetric({ label, value }: { label: string; value: string }) { return <HeaderStat label={label} value={value} /> }

export function PlatformRouteMetrics({ children }: { children: ReactNode }) { return <PlatformMetricRow>{children}</PlatformMetricRow> }

export function PlatformRoutePill({ children }: { children: ReactNode }) { return <PlatformPill>{children}</PlatformPill> }

export function PlatformRoutePills({ children }: { children: ReactNode }) { return <PlatformPills>{children}</PlatformPills> }

export function PlatformRouteList({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformCardList items={items} /> }

export function PlatformRouteCallout({ children }: { children: ReactNode }) { return <PlatformCallout>{children}</PlatformCallout> }

export function PlatformRouteAction({ children }: { children: ReactNode }) { return <PlatformAction>{children}</PlatformAction> }

export function PlatformRouteText({ children }: { children: ReactNode }) { return <PlatformText>{children}</PlatformText> }

export function PlatformRouteLabel({ children }: { children: ReactNode }) { return <PlatformLabel>{children}</PlatformLabel> }

export function PlatformRouteTitle({ children }: { children: ReactNode }) { return <PlatformTitle>{children}</PlatformTitle> }

export function PlatformRouteRow({ children }: { children: ReactNode }) { return <PlatformRow>{children}</PlatformRow> }

export function PlatformRouteSpacer() { return <PlatformSpacer /> }

export function PlatformRouteAccent({ children }: { children: ReactNode }) { return <PlatformAccent>{children}</PlatformAccent> }

export function PlatformRouteMeta({ children }: { children: ReactNode }) { return <PlatformMeta>{children}</PlatformMeta> }

export function PlatformRouteDivider() { return <PlatformDivider /> }

export function PlatformRouteContent({ children }: { children: ReactNode }) { return <PlatformContent>{children}</PlatformContent> }

export function PlatformRouteOverview({ children }: { children: ReactNode }) { return <PlatformOverview>{children}</PlatformOverview> }

export function PlatformRouteSurface({ children }: { children: ReactNode }) { return <PlatformSurface>{children}</PlatformSurface> }

export function PlatformRouteStats({ children }: { children: ReactNode }) { return <PlatformStats>{children}</PlatformStats> }

export function PlatformRouteFootnote({ children }: { children: ReactNode }) { return <PlatformFootnote>{children}</PlatformFootnote> }

export function PlatformRouteGridItem({ title, detail }: { title: string; detail: string }) { return <PlatformGridItem title={title} detail={detail} /> }

export function PlatformRouteGridItems({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformRouteTiles items={items} /> }

export function PlatformRouteSummary({ title, detail }: { title: string; detail: string }) { return <PlatformSummary title={title} detail={detail} /> }

export function PlatformRouteSummaryGrid({ children }: { children: ReactNode }) { return <PlatformSummaryGrid>{children}</PlatformSummaryGrid> }

export function PlatformRouteSummaryCard({ title, detail }: { title: string; detail: string }) { return <PlatformSummaryCard title={title} detail={detail} /> }

export function PlatformRouteShell({ children }: { children: ReactNode }) { return <PlatformShell>{children}</PlatformShell> }

export function PlatformRouteSurfaceCard({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformRouteSurfaceCards({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformGrid>{items.map((item) => <PlatformRouteSurfaceCard key={item.title} {...item} />)}</PlatformGrid> }

export function PlatformRouteSurfaceGrid({ children }: { children: ReactNode }) { return <PlatformGrid>{children}</PlatformGrid> }

export function PlatformRouteSurfaceItem({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformRouteSurfaceItems({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformRouteSurfaceCards items={items} /> }

export function PlatformRouteSurfaceTitle({ children }: { children: ReactNode }) { return <PlatformHeading>{children}</PlatformHeading> }

export function PlatformRouteSurfaceText({ children }: { children: ReactNode }) { return <PlatformCopy>{children}</PlatformCopy> }

export function PlatformRouteSurfaceMeta({ children }: { children: ReactNode }) { return <PlatformMeta>{children}</PlatformMeta> }

export function PlatformRouteSurfacePill({ children }: { children: ReactNode }) { return <PlatformPill>{children}</PlatformPill> }

export function PlatformRouteSurfacePills({ children }: { children: ReactNode }) { return <PlatformPills>{children}</PlatformPills> }

export function PlatformRouteSurfaceCallout({ children }: { children: ReactNode }) { return <PlatformCallout>{children}</PlatformCallout> }

export function PlatformRouteSurfaceFooter({ children }: { children: ReactNode }) { return <PlatformRouteFooter>{children}</PlatformRouteFooter> }

export function PlatformRouteSurfaceHeader({ children }: { children: ReactNode }) { return <PlatformRouteHeader>{children}</PlatformRouteHeader> }

export function PlatformRouteSurfaceBody({ children }: { children: ReactNode }) { return <PlatformRouteBody>{children}</PlatformRouteBody> }

export function PlatformRouteSurfaceSection({ children }: { children: ReactNode }) { return <PlatformSection>{children}</PlatformSection> }

export function PlatformRouteSurfaceSectionTitle({ children }: { children: ReactNode }) { return <PlatformSectionTitle>{children}</PlatformSectionTitle> }

export function PlatformRouteSurfaceSectionText({ children }: { children: ReactNode }) { return <PlatformSectionCopy>{children}</PlatformSectionCopy> }

export function PlatformRouteSurfaceMetric({ label, value }: { label: string; value: string }) { return <HeaderStat label={label} value={value} /> }

export function PlatformRouteSurfaceMetrics({ children }: { children: ReactNode }) { return <PlatformMetricRow>{children}</PlatformMetricRow> }

export function PlatformRouteSurfaceList({ items }: { items: Array<{ title: string; detail: string }> }) { return <PlatformList>{items.map((item) => <PlatformListItem key={item.title} {...item} />)}</PlatformList> }

export function PlatformRouteSurfaceAction({ children }: { children: ReactNode }) { return <PlatformAction>{children}</PlatformAction> }

export function PlatformRouteSurfaceLabel({ children }: { children: ReactNode }) { return <PlatformLabel>{children}</PlatformLabel> }

export function PlatformRouteSurfaceAccent({ children }: { children: ReactNode }) { return <PlatformAccent>{children}</PlatformAccent> }

export function PlatformRouteSurfaceSpacer() { return <PlatformSpacer /> }

export function PlatformRouteSurfaceRow({ children }: { children: ReactNode }) { return <PlatformRow>{children}</PlatformRow> }

export function PlatformRouteSurfaceDivider() { return <PlatformDivider /> }

export function PlatformRouteSurfaceFootnote({ children }: { children: ReactNode }) { return <PlatformFootnote>{children}</PlatformFootnote> }

export function PlatformRouteSurfaceOverview({ children }: { children: ReactNode }) { return <PlatformOverview>{children}</PlatformOverview> }

export function PlatformRouteSurfaceContent({ children }: { children: ReactNode }) { return <PlatformContent>{children}</PlatformContent> }

export function PlatformRouteSurfaceShell({ children }: { children: ReactNode }) { return <PlatformShell>{children}</PlatformShell> }

export function PlatformRouteSurfaceSummary({ title, detail }: { title: string; detail: string }) { return <PlatformSummary title={title} detail={detail} /> }

export function PlatformRouteSurfaceSummaryGrid({ children }: { children: ReactNode }) { return <PlatformGrid>{children}</PlatformGrid> }

export function PlatformRouteSurfaceSummaryCard({ title, detail }: { title: string; detail: string }) { return <FeatureCard title={title} detail={detail} /> }

export function PlatformRouteSurfaceRoute({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: ReactNode }) { return <PlatformPage eyebrow={eyebrow} title={title} description={description}>{children}</PlatformPage> }
