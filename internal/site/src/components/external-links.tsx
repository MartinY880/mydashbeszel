import { Trans } from "@lingui/react/macro"
import { useStore } from "@nanostores/react"
import {
	BookIcon,
	CameraIcon,
	ChevronDownIcon,
	CloudIcon,
	DatabaseIcon,
	ExternalLinkIcon,
	FileIcon,
	FolderIcon,
	GlobeIcon,
	HomeIcon,
	LinkIcon,
	LockIcon,
	MailIcon,
	MonitorIcon,
	MusicIcon,
	ServerIcon,
	SettingsIcon,
	ShieldIcon,
	StarIcon,
	TerminalIcon,
	VideoIcon,
	WifiIcon,
} from "lucide-react"
import { useMemo, type ComponentType, type SVGProps } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, useBrowserStorage } from "@/lib/utils"
import { $externalLinks } from "@/lib/stores"

const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
	globe: GlobeIcon,
	link: LinkIcon,
	star: StarIcon,
	home: HomeIcon,
	server: ServerIcon,
	database: DatabaseIcon,
	cloud: CloudIcon,
	shield: ShieldIcon,
	monitor: MonitorIcon,
	mail: MailIcon,
	file: FileIcon,
	folder: FolderIcon,
	camera: CameraIcon,
	music: MusicIcon,
	video: VideoIcon,
	settings: SettingsIcon,
	terminal: TerminalIcon,
	wifi: WifiIcon,
	lock: LockIcon,
	book: BookIcon,
}

export function ExternalLinks() {
	const externalLinks = useStore($externalLinks)
	const [isOpen, setIsOpen] = useBrowserStorage("el-open", true)

	// Group by category
	const grouped = useMemo(() => {
		const map = new Map<string, typeof externalLinks>()
		for (const link of externalLinks) {
			const cat = link.category || "Uncategorized"
			if (!map.has(cat)) map.set(cat, [])
			map.get(cat)!.push(link)
		}
		return map
	}, [externalLinks])

	if (externalLinks.length === 0) {
		return null
	}

	return (
		<Card>
			<CardHeader
				className="pb-0 px-4 sm:px-6 pt-3 sm:pt-4 cursor-pointer select-none"
				onClick={() => setIsOpen(!isOpen)}
			>
				<CardTitle className="flex items-center gap-2 text-base">
					<ExternalLinkIcon className="h-4 w-4" />
					<Trans>External Links</Trans>
					<ChevronDownIcon
						className={cn("h-4 w-4 ms-auto text-muted-foreground transition-transform duration-200", {
							"rotate-180": isOpen,
						})}
					/>
				</CardTitle>
			</CardHeader>
			{isOpen && (
				<CardContent className="px-4 sm:px-6 pb-3 pt-3 space-y-4">
					{Array.from(grouped.entries()).map(([category, links]) => (
						<div key={category}>
							{grouped.size > 1 && (
								<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
									{category}
								</div>
							)}
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
								{links.map((link) => {
									const IconComponent = ICON_MAP[link.icon] || GlobeIcon
									return (
										<a
											key={link.id}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2.5 transition-colors hover:bg-accent/50 group"
										>
											<IconComponent className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
											<span className="font-medium text-xs leading-tight break-words min-w-0">
												{link.label}
											</span>
										</a>
									)
								})}
							</div>
						</div>
					))}
				</CardContent>
			)}
			{!isOpen && <div className="pb-3" />}
		</Card>
	)
}
