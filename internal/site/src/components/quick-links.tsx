import { Trans } from "@lingui/react/macro"
import { useStore } from "@nanostores/react"
import {
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

	return (
		<>
			<Card>
				<CardHeader className="pb-3 px-4 sm:px-6 pt-4 sm:pt-5">
					<CardTitle className="flex items-center gap-2 text-lg">
						<LinkIcon className="h-5 w-5" />
						<Trans>Quick Links</Trans>
					</CardTitle>
				</CardHeader>
				<CardContent className="px-4 sm:px-6 pb-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
						{quickLinks.map((link) => (
							<QuickLinkCard
								key={link.id}
								link={link}
								onEdit={() => openEditDialog(link)}
								onRemove={() => removeLink(link.id)}
							/>
						))}
					</div>
				</CardContent>
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
}: {
	link: QuickLink
	onEdit: () => void
	onRemove: () => void
}) {
	return (
		<div className="group relative flex flex-col gap-2 rounded-lg border border-border/60 bg-background p-3 transition-colors hover:bg-accent/50">
			{/* Header row: name + action buttons */}
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-sm truncate">{link.name}</span>
				<div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7"
						onClick={onEdit}
						title="Edit"
					>
						<PencilIcon className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-7 w-7 text-destructive hover:text-destructive"
						onClick={onRemove}
						title="Remove"
					>
						<TrashIcon className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
			{/* Link buttons */}
			<div className="flex gap-2">
				{link.localUrl && (
					<a
						href={link.localUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 justify-center"
					>
						<NetworkIcon className="h-3.5 w-3.5" />
						Local
					</a>
				)}
				{link.domainUrl && (
					<a
						href={link.domainUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex-1 justify-center"
					>
						<GlobeIcon className="h-3.5 w-3.5" />
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
