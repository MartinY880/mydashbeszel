import { useStore } from "@nanostores/react"
import {
	BookIcon,
	CameraIcon,
	CloudIcon,
	DatabaseIcon,
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
import type { ComponentType, SVGProps } from "react"
import { $externalLinks } from "@/lib/stores"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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

export { ICON_MAP }

export function ExternalLinksBar() {
	const externalLinks = useStore($externalLinks)

	if (externalLinks.length === 0) {
		return null
	}

	return (
		<div className="hidden lg:flex items-center gap-1 mx-auto">
			{externalLinks.map((link) => {
				const IconComponent = ICON_MAP[link.icon] || GlobeIcon
				return (
					<Tooltip key={link.id}>
						<TooltipTrigger asChild>
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md hover:bg-accent transition-colors min-w-[3rem]"
							>
								<IconComponent className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
								<span className="text-[10px] leading-tight text-muted-foreground truncate max-w-[4rem]">
									{link.label}
								</span>
							</a>
						</TooltipTrigger>
						<TooltipContent>{link.label}</TooltipContent>
					</Tooltip>
				)
			})}
		</div>
	)
}
