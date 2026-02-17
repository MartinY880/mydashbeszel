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
	PlusIcon,
} from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn, useBrowserStorage } from "@/lib/utils"
import { $quickLinks, $allSystemsById } from "@/lib/stores"
import { saveQuickLinks } from "@/lib/api"
import type { QuickLink } from "@/types"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

const STATUS_COLORS: Record<string, string> = {
	up: "bg-green-500",
	down: "bg-red-500",
	paused: "bg-primary/40",
	pending: "bg-yellow-500",
}

export function QuickLinks() {
	const quickLinks = useStore($quickLinks)
	const systemsById = useStore($allSystemsById)
	const [isOpen, setIsOpen] = useBrowserStorage("ql-open", true)
	const [editingLink, setEditingLink] = useState<QuickLink | null>(null)
	const [editName, setEditName] = useState("")
	const [editLocalUrl, setEditLocalUrl] = useState("")
	const [editDomainUrl, setEditDomainUrl] = useState("")
	const [editCategory, setEditCategory] = useState("")

	// Add dialog state
	const [addOpen, setAddOpen] = useState(false)
	const [addName, setAddName] = useState("")
	const [addLocalUrl, setAddLocalUrl] = useState("")
	const [addDomainUrl, setAddDomainUrl] = useState("")
	const [addCategory, setAddCategory] = useState("")

	// Group links by category
	const grouped = useMemo(() => {
		const map = new Map<string, QuickLink[]>()
		for (const link of quickLinks) {
			const cat = link.category || "Uncategorized"
			if (!map.has(cat)) map.set(cat, [])
			map.get(cat)!.push(link)
		}
		return map
	}, [quickLinks])

	// Collect existing categories for the select dropdown
	const existingCategories = useMemo(() => {
		const cats = new Set<string>()
		for (const link of quickLinks) {
			if (link.category) cats.add(link.category)
		}
		return Array.from(cats).sort()
	}, [quickLinks])

	function addNewLink() {
		if (!addName.trim()) return
		const newLink: QuickLink = {
			id: crypto.randomUUID(),
			name: addName.trim(),
			localUrl: addLocalUrl,
			domainUrl: addDomainUrl,
			category: addCategory,
		}
		saveQuickLinks([...quickLinks, newLink])
		setAddOpen(false)
		setAddName("")
		setAddLocalUrl("")
		setAddDomainUrl("")
		setAddCategory("")
	}

	function openEditDialog(link: QuickLink) {
		setEditingLink(link)
		setEditName(link.name)
		setEditLocalUrl(link.localUrl)
		setEditDomainUrl(link.domainUrl)
		setEditCategory(link.category || "")
	}

	function saveEdit() {
		if (!editingLink) return
		const updated = quickLinks.map((l) =>
			l.id === editingLink.id
				? { ...l, name: editName, localUrl: editLocalUrl, domainUrl: editDomainUrl, category: editCategory }
				: l
		)
		saveQuickLinks(updated)
		setEditingLink(null)
	}

	function removeLink(id: string) {
		saveQuickLinks(quickLinks.filter((l) => l.id !== id))
	}

	function moveLink(id: string, direction: -1 | 1) {
		// Move within the full list (respects overall order)
		const idx = quickLinks.findIndex((l) => l.id === id)
		if (idx < 0) return
		// Find next item in the same category
		const category = quickLinks[idx].category || "Uncategorized"
		let targetIdx = -1
		if (direction === -1) {
			for (let i = idx - 1; i >= 0; i--) {
				if ((quickLinks[i].category || "Uncategorized") === category) {
					targetIdx = i
					break
				}
			}
		} else {
			for (let i = idx + 1; i < quickLinks.length; i++) {
				if ((quickLinks[i].category || "Uncategorized") === category) {
					targetIdx = i
					break
				}
			}
		}
		if (targetIdx < 0) return
		const reordered = [...quickLinks]
		const [item] = reordered.splice(idx, 1)
		reordered.splice(targetIdx, 0, item)
		saveQuickLinks(reordered)
	}

	function getSystemStatus(linkId: string): string | undefined {
		const system = systemsById[linkId]
		return system?.status
	}

	return (
		<>
			<Card>
				<CardHeader className="pb-0 px-4 sm:px-6 pt-3 sm:pt-4">
					<CardTitle className="flex items-center gap-2 text-base">
						<button
							className="flex items-center gap-2 flex-1 cursor-pointer select-none"
							onClick={() => setIsOpen(!isOpen)}
						>
							<LinkIcon className="h-4 w-4" />
							<Trans>Quick Links</Trans>
							<ChevronDownIcon
								className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", {
									"rotate-180": isOpen,
								})}
							/>
						</button>
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7"
							title="Add quick link"
							onClick={(e) => {
								e.stopPropagation()
								setAddOpen(true)
							}}
						>
							<PlusIcon className="h-4 w-4" />
						</Button>
					</CardTitle>
				</CardHeader>
				{isOpen && quickLinks.length > 0 && (
					<CardContent className="px-4 sm:px-6 pb-3 pt-3 space-y-4">
						{Array.from(grouped.entries()).map(([category, links]) => (
							<CategoryGroup
								key={category}
								category={category}
								links={links}
								allLinks={quickLinks}
								getSystemStatus={getSystemStatus}
								onEdit={openEditDialog}
								onRemove={removeLink}
								onMove={moveLink}
							/>
						))}
					</CardContent>
				)}
				{isOpen && quickLinks.length === 0 && (
					<CardContent className="px-4 sm:px-6 pb-3 pt-3">
						<p className="text-sm text-muted-foreground italic">
							<Trans>No quick links yet. Click + to add one.</Trans>
						</p>
					</CardContent>
				)}
				{!isOpen && <div className="pb-3" />}
			</Card>

			{/* Add Dialog */}
			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogContent className="w-[90%] sm:max-w-md rounded-lg">
					<DialogHeader>
						<DialogTitle>
							<Trans>Add Quick Link</Trans>
						</DialogTitle>
					</DialogHeader>
					<div className="grid gap-4 py-2">
						<div className="grid gap-2">
							<Label htmlFor="add-ql-name">
								<Trans>Name</Trans>
							</Label>
							<Input
								id="add-ql-name"
								placeholder="My App"
								value={addName}
								onChange={(e) => setAddName(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="add-ql-category">
								<Trans>Category</Trans>
							</Label>
							<div className="flex gap-2">
								<Input
									id="add-ql-category"
									placeholder="e.g. Media, Network, Home..."
									value={addCategory}
									onChange={(e) => setAddCategory(e.target.value)}
								/>
								{existingCategories.length > 0 && (
									<Select value={addCategory} onValueChange={setAddCategory}>
										<SelectTrigger className="w-[140px] shrink-0">
											<SelectValue placeholder="Pick..." />
										</SelectTrigger>
										<SelectContent>
											{existingCategories.map((cat) => (
												<SelectItem key={cat} value={cat}>
													{cat}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="add-ql-local">
								<Trans>Local URL</Trans>
							</Label>
							<Input
								id="add-ql-local"
								placeholder="http://192.168.1.100:8080"
								value={addLocalUrl}
								onChange={(e) => setAddLocalUrl(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="add-ql-domain">
								<Trans>Domain URL</Trans>
							</Label>
							<Input
								id="add-ql-domain"
								placeholder="https://app.domain.com"
								value={addDomainUrl}
								onChange={(e) => setAddDomainUrl(e.target.value)}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddOpen(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={addNewLink} disabled={!addName.trim()}>
							<Trans>Add</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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
							<Label htmlFor="ql-category">
								<Trans>Category</Trans>
							</Label>
							<div className="flex gap-2">
								<Input
									id="ql-category"
									placeholder="e.g. Media, Network, Home..."
									value={editCategory}
									onChange={(e) => setEditCategory(e.target.value)}
								/>
								{existingCategories.length > 0 && (
									<Select value={editCategory} onValueChange={setEditCategory}>
										<SelectTrigger className="w-[140px] shrink-0">
											<SelectValue placeholder="Pick..." />
										</SelectTrigger>
										<SelectContent>
											{existingCategories.map((cat) => (
												<SelectItem key={cat} value={cat}>
													{cat}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>
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

function CategoryGroup({
	category,
	links,
	allLinks,
	getSystemStatus,
	onEdit,
	onRemove,
	onMove,
}: {
	category: string
	links: QuickLink[]
	allLinks: QuickLink[]
	getSystemStatus: (id: string) => string | undefined
	onEdit: (link: QuickLink) => void
	onRemove: (id: string) => void
	onMove: (id: string, direction: -1 | 1) => void
}) {
	const [isOpen, setIsOpen] = useBrowserStorage(`ql-cat-${category}`, true)

	return (
		<div>
			<button
				className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors w-full"
				onClick={() => setIsOpen(!isOpen)}
			>
				<ChevronDownIcon
					className={cn("h-3 w-3 transition-transform duration-200", {
						"-rotate-90": !isOpen,
					})}
				/>
				{category}
			</button>
			{isOpen && (
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
					{links.map((link, idx) => (
						<QuickLinkCard
							key={link.id}
							link={link}
							status={getSystemStatus(link.id)}
							onEdit={() => onEdit(link)}
							onRemove={() => onRemove(link.id)}
							onMoveLeft={idx > 0 ? () => onMove(link.id, -1) : undefined}
							onMoveRight={idx < links.length - 1 ? () => onMove(link.id, 1) : undefined}
						/>
					))}
				</div>
			)}
		</div>
	)
}

function QuickLinkCard({
	link,
	status,
	onEdit,
	onRemove,
	onMoveLeft,
	onMoveRight,
}: {
	link: QuickLink
	status?: string
	onEdit: () => void
	onRemove: () => void
	onMoveLeft?: () => void
	onMoveRight?: () => void
}) {
	const statusColor = status ? STATUS_COLORS[status] || "bg-primary/40" : undefined

	return (
		<div className="group relative flex flex-col gap-1.5 rounded-lg border border-border/60 bg-background p-2.5 transition-colors hover:bg-accent/50">
			{/* Header row: status dot + name + action buttons */}
			<div className="flex items-start justify-between gap-1">
				<span className="flex items-center gap-1.5 font-medium text-xs leading-tight break-words min-w-0">
					{statusColor && (
						<span
							className={cn("shrink-0 size-2 rounded-full", statusColor)}
							title={status}
						/>
					)}
					{link.name}
				</span>
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
