import { Trans } from "@lingui/react/macro"
import { useStore } from "@nanostores/react"
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ChevronDownIcon,
	GlobeIcon,
	NetworkIcon,
	PencilIcon,
	TrashIcon,
	LinkIcon,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, useBrowserStorage } from "@/lib/utils"
import { $quickLinks } from "@/lib/stores"
import { saveQuickLinks } from "@/lib/api"
import type { QuickLink } from "@/types"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

export function QuickLinks() {
	const quickLinks = useStore($quickLinks)
	const [isOpen, setIsOpen] = useBrowserStorage("ql-open", true)
	const [editingLink, setEditingLink] = useState<QuickLink | null>(null)
	const [editName, setEditName] = useState("")
	const [editLocalUrl, setEditLocalUrl] = useState("")
	const [editDomainUrl, setEditDomainUrl] = useState("")

	if (quickLinks.length === 0) {
		return null
	}

	function openEditDialog(link: QuickLink) {
		setEditingLink(link)
		setEditName(link.name)
		setEditLocalUrl(link.localUrl)
		setEditDomainUrl(link.domainUrl)
	}

	function saveEdit() {
		if (!editingLink) return
		const updated = quickLinks.map((l) =>
			l.id === editingLink.id
				? { ...l, name: editName, localUrl: editLocalUrl, domainUrl: editDomainUrl }
				: l
		)
		saveQuickLinks(updated)
		setEditingLink(null)
	}

	function removeLink(id: string) {
		saveQuickLinks(quickLinks.filter((l) => l.id !== id))
	}

	function moveLink(id: string, direction: -1 | 1) {
		const idx = quickLinks.findIndex((l) => l.id === id)
		if (idx < 0) return
		const newIdx = idx + direction
		if (newIdx < 0 || newIdx >= quickLinks.length) return
		const reordered = [...quickLinks]
		const [item] = reordered.splice(idx, 1)
		reordered.splice(newIdx, 0, item)
		saveQuickLinks(reordered)
	}

	return (
		<>
			<Card>
				<CardHeader
					className="pb-0 px-4 sm:px-6 pt-3 sm:pt-4 cursor-pointer select-none"
					onClick={() => setIsOpen(!isOpen)}
				>
					<CardTitle className="flex items-center gap-2 text-base">
						<LinkIcon className="h-4 w-4" />
						<Trans>Quick Links</Trans>
						<ChevronDownIcon
							className={cn("h-4 w-4 ms-auto text-muted-foreground transition-transform duration-200", {
								"rotate-180": isOpen,
							})}
						/>
					</CardTitle>
				</CardHeader>
				{isOpen && (
					<CardContent className="px-4 sm:px-6 pb-3 pt-3">
						<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
							{quickLinks.map((link, idx) => (
								<QuickLinkCard
									key={link.id}
									link={link}
									onEdit={() => openEditDialog(link)}
									onRemove={() => removeLink(link.id)}
									onMoveLeft={idx > 0 ? () => moveLink(link.id, -1) : undefined}
									onMoveRight={idx < quickLinks.length - 1 ? () => moveLink(link.id, 1) : undefined}
								/>
							))}
						</div>
					</CardContent>
				)}
				{!isOpen && <div className="pb-3" />}
			</Card>

			{/* Edit Dialog */}
			<Dialog open={!!editingLink} onOpenChange={(open) => !open && setEditingLink(null)}>
				<DialogContent className="w-[90%] sm:max-w-md rounded-lg">
					<DialogHeader>
						<DialogTitle>
							<Trans>Edit Quick Link</Trans>
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="ql-name">
								<Trans>Name</Trans>
							</Label>
							<Input
								id="ql-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="ql-local">
								<Trans>Local URL</Trans>
							</Label>
							<Input
								id="ql-local"
								placeholder="http://192.168.1.100:8080"
								value={editLocalUrl}
								onChange={(e) => setEditLocalUrl(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="ql-domain">
								<Trans>Domain URL</Trans>
							</Label>
							<Input
								id="ql-domain"
								placeholder="https://app.domain.com"
								value={editDomainUrl}
								onChange={(e) => setEditDomainUrl(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingLink(null)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={saveEdit}>
							<Trans>Save</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	)
}

function QuickLinkCard({
	link,
	onEdit,
	onRemove,
	onMoveLeft,
	onMoveRight,
}: {
	link: QuickLink
	onEdit: () => void
	onRemove: () => void
	onMoveLeft?: () => void
	onMoveRight?: () => void
}) {
	return (
		<div className="group relative flex flex-col gap-1.5 rounded-lg border border-border/60 bg-background p-2.5 transition-colors hover:bg-accent/50">
			{/* Header row: name + action buttons */}
			<div className="flex items-start justify-between gap-1">
				<span className="font-medium text-xs leading-tight break-words min-w-0">{link.name}</span>
				<div className="flex items-center gap-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
					{onMoveLeft && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={onMoveLeft}
							title="Move left"
						>
							<ArrowLeftIcon className="h-3 w-3" />
						</Button>
					)}
					{onMoveRight && (
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={onMoveRight}
							title="Move right"
						>
							<ArrowRightIcon className="h-3 w-3" />
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={onEdit}
						title="Edit"
					>
						<PencilIcon className="h-3 w-3" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 text-destructive hover:text-destructive"
						onClick={onRemove}
						title="Remove"
					>
						<TrashIcon className="h-3 w-3" />
					</Button>
				</div>
			</div>
			{/* Link buttons */}
			<div className="flex gap-1.5">
				{link.localUrl && (
					<a
						href={link.localUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 justify-center"
					>
						<NetworkIcon className="h-3 w-3" />
						Local
					</a>
				)}
				{link.domainUrl && (
					<a
						href={link.domainUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 justify-center"
					>
						<GlobeIcon className="h-3 w-3" />
						Domain
					</a>
				)}
				{!link.localUrl && !link.domainUrl && (
					<span className="text-xs text-muted-foreground italic">
						<Trans>No URLs configured</Trans>
					</span>
				)}
			</div>
		</div>
	)
}
