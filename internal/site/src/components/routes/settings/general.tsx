/** biome-ignore-all lint/correctness/useUniqueElementIds: component is only rendered once */
import { Trans, useLingui } from "@lingui/react/macro"
import {
	ExternalLinkIcon,
	LanguagesIcon,
	LoaderCircleIcon,
	PencilIcon,
	PlusIcon,
	SaveIcon,
	TrashIcon,
} from "lucide-react"
import { useState } from "react"
import { useStore } from "@nanostores/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Slider from "@/components/ui/slider"
import { HourFormat, Unit } from "@/lib/enums"
import { dynamicActivate } from "@/lib/i18n"
import languages from "@/lib/languages"
import { $externalLinks, $userSettings } from "@/lib/stores"
import { saveExternalLinks } from "@/lib/api"
import { chartTimeData, currentHour12 } from "@/lib/utils"
import type { ExternalLink, UserSettings } from "@/types"
import { saveSettings } from "./layout"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"

export default function SettingsProfilePage({ userSettings }: { userSettings: UserSettings }) {
	const [isLoading, setIsLoading] = useState(false)
	const { i18n } = useLingui()
	const currentUserSettings = useStore($userSettings)
	const layoutWidth = currentUserSettings.layoutWidth ?? 1500

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setIsLoading(true)
		const formData = new FormData(e.target as HTMLFormElement)
		const data = Object.fromEntries(formData) as Partial<UserSettings>
		await saveSettings(data)
		setIsLoading(false)
	}

	return (
		<div>
			<div>
				<h3 className="text-xl font-medium mb-2">
					<Trans>General</Trans>
				</h3>
				<p className="text-sm text-muted-foreground leading-relaxed">
					<Trans>Change general application options.</Trans>
				</p>
			</div>
			<Separator className="my-4" />
			<form onSubmit={handleSubmit} className="space-y-5">
				<div className="grid gap-2">
					<div className="mb-2">
						<h3 className="mb-1 text-lg font-medium flex items-center gap-2">
							<LanguagesIcon className="h-4 w-4" />
							<Trans>Language</Trans>
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							<Trans>
								Want to help improve our translations? Check{" "}
								<a href="https://crowdin.com/project/beszel" className="link" target="_blank" rel="noopener noreferrer">
									Crowdin
								</a>{" "}
								for details.
							</Trans>
						</p>
					</div>
					<Label className="block" htmlFor="lang">
						<Trans>Preferred Language</Trans>
					</Label>
					<Select value={i18n.locale} onValueChange={(lang: string) => dynamicActivate(lang)}>
						<SelectTrigger id="lang">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{languages.map(([lang, label, e]) => (
								<SelectItem key={lang} value={lang}>
									<span className="me-2.5">{e}</span>
									{label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<Separator />
				<div className="grid gap-2">
					<div className="mb-2">
						<h3 className="mb-1 text-lg font-medium">
							<Trans>Layout width</Trans>
						</h3>
						<Label htmlFor="layoutWidth" className="text-sm text-muted-foreground leading-relaxed">
							<Trans>Adjust the width of the main layout</Trans> ({layoutWidth}px)
						</Label>
					</div>
					<Slider
						id="layoutWidth"
						name="layoutWidth"
						value={[layoutWidth]}
						onValueChange={(val) => $userSettings.setKey("layoutWidth", val[0])}
						min={1000}
						max={2000}
						step={10}
						className="w-full mb-1"
					/>
				</div>
				<Separator />
				<div className="grid gap-2">
					<div className="mb-2">
						<h3 className="mb-1 text-lg font-medium">
							<Trans>Chart options</Trans>
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							<Trans>Adjust display options for charts.</Trans>
						</p>
					</div>
					<div className="grid sm:grid-cols-3 gap-4">
						<div className="grid gap-2">
							<Label className="block" htmlFor="chartTime">
								<Trans>Default time period</Trans>
							</Label>
							<Select name="chartTime" key={userSettings.chartTime} defaultValue={userSettings.chartTime}>
								<SelectTrigger id="chartTime">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(chartTimeData).map(([value, { label }]) => (
										<SelectItem key={value} value={value}>
											{label()}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="block" htmlFor="hourFormat">
								<Trans>Time format</Trans>
							</Label>
							<Select
								name="hourFormat"
								key={userSettings.hourFormat}
								defaultValue={userSettings.hourFormat ?? (currentHour12() ? HourFormat["12h"] : HourFormat["24h"])}
							>
								<SelectTrigger id="hourFormat">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(HourFormat).map((value) => (
										<SelectItem key={value} value={value}>
											{value}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<Separator />
				<div className="grid gap-2">
					<div className="mb-2">
						<h3 className="mb-1 text-lg font-medium">
							<Trans comment="Temperature / network units">Unit preferences</Trans>
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							<Trans>Change display units for metrics.</Trans>
						</p>
					</div>
					<div className="grid sm:grid-cols-3 gap-4">
						<div className="grid gap-2">
							<Label className="block" htmlFor="unitTemp">
								<Trans>Temperature unit</Trans>
							</Label>
							<Select
								name="unitTemp"
								key={userSettings.unitTemp}
								defaultValue={userSettings.unitTemp?.toString() || String(Unit.Celsius)}
							>
								<SelectTrigger id="unitTemp">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={String(Unit.Celsius)}>
										<Trans>Celsius (°C)</Trans>
									</SelectItem>
									<SelectItem value={String(Unit.Fahrenheit)}>
										<Trans>Fahrenheit (°F)</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="block" htmlFor="unitNet">
								<Trans comment="Context: Bytes or bits">Network unit</Trans>
							</Label>
							<Select
								name="unitNet"
								key={userSettings.unitNet}
								defaultValue={userSettings.unitNet?.toString() ?? String(Unit.Bytes)}
							>
								<SelectTrigger id="unitNet">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={String(Unit.Bytes)}>
										<Trans>Bytes (KB/s, MB/s, GB/s)</Trans>
									</SelectItem>
									<SelectItem value={String(Unit.Bits)}>
										<Trans>Bits (Kbps, Mbps, Gbps)</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="block" htmlFor="unitDisk">
								<Trans>Disk unit</Trans>
							</Label>
							<Select
								name="unitDisk"
								key={userSettings.unitDisk}
								defaultValue={userSettings.unitDisk?.toString() ?? String(Unit.Bytes)}
							>
								<SelectTrigger id="unitDisk">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={String(Unit.Bytes)}>
										<Trans>Bytes (KB/s, MB/s, GB/s)</Trans>
									</SelectItem>
									<SelectItem value={String(Unit.Bits)}>
										<Trans>Bits (Kbps, Mbps, Gbps)</Trans>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<Separator />
				<div className="grid gap-2">
					<div className="mb-2">
						<h3 className="mb-1 text-lg font-medium">
							<Trans>Warning thresholds</Trans>
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							<Trans>Set percentage thresholds for meter colors.</Trans>
						</p>
					</div>
					<div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-end">
						<div className="grid gap-2">
							<Label htmlFor="colorWarn">
								<Trans>Warning (%)</Trans>
							</Label>
							<Input
								id="colorWarn"
								name="colorWarn"
								type="number"
								min={1}
								max={100}
								className="min-w-24"
								defaultValue={userSettings.colorWarn ?? 65}
							/>
						</div>
						<div className="grid gap-1">
							<Label htmlFor="colorCrit">
								<Trans>Critical (%)</Trans>
							</Label>
							<Input
								id="colorCrit"
								name="colorCrit"
								type="number"
								min={1}
								max={100}
								className="min-w-24"
								defaultValue={userSettings.colorCrit ?? 90}
							/>
						</div>
					</div>
				</div>
				<Separator />
				<Button type="submit" className="flex items-center gap-1.5 disabled:opacity-100" disabled={isLoading}>
					{isLoading ? <LoaderCircleIcon className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
					<Trans>Save Settings</Trans>
				</Button>
			</form>
			<Separator className="my-5" />
			<ExternalLinksManager />
		</div>
	)
}

const ICON_OPTIONS = [
	{ value: "globe", label: "Globe" },
	{ value: "link", label: "Link" },
	{ value: "star", label: "Star" },
	{ value: "home", label: "Home" },
	{ value: "server", label: "Server" },
	{ value: "database", label: "Database" },
	{ value: "cloud", label: "Cloud" },
	{ value: "shield", label: "Shield" },
	{ value: "monitor", label: "Monitor" },
	{ value: "mail", label: "Mail" },
	{ value: "file", label: "File" },
	{ value: "folder", label: "Folder" },
	{ value: "camera", label: "Camera" },
	{ value: "music", label: "Music" },
	{ value: "video", label: "Video" },
	{ value: "settings", label: "Settings" },
	{ value: "terminal", label: "Terminal" },
	{ value: "wifi", label: "WiFi" },
	{ value: "lock", label: "Lock" },
	{ value: "book", label: "Book" },
] as const

function ExternalLinksManager() {
	const externalLinks = useStore($externalLinks)
	const [editLink, setEditLink] = useState<ExternalLink | null>(null)
	const [addOpen, setAddOpen] = useState(false)

	// Form state for add/edit
	const [formLabel, setFormLabel] = useState("")
	const [formUrl, setFormUrl] = useState("")
	const [formIcon, setFormIcon] = useState("globe")
	const [formCategory, setFormCategory] = useState("")

	function openAdd() {
		setFormLabel("")
		setFormUrl("")
		setFormIcon("globe")
		setFormCategory("")
		setAddOpen(true)
	}

	function openEdit(link: ExternalLink) {
		setEditLink(link)
		setFormLabel(link.label)
		setFormUrl(link.url)
		setFormIcon(link.icon || "globe")
		setFormCategory(link.category || "")
	}

	function handleAdd() {
		if (!formLabel.trim() || !formUrl.trim()) return
		const newLink: ExternalLink = {
			id: crypto.randomUUID(),
			label: formLabel.trim(),
			url: formUrl.trim(),
			icon: formIcon,
			category: formCategory,
		}
		saveExternalLinks([...externalLinks, newLink])
		setAddOpen(false)
	}

	function handleSaveEdit() {
		if (!editLink || !formLabel.trim() || !formUrl.trim()) return
		const updated = externalLinks.map((l) =>
			l.id === editLink.id
				? { ...l, label: formLabel.trim(), url: formUrl.trim(), icon: formIcon, category: formCategory }
				: l
		)
		saveExternalLinks(updated)
		setEditLink(null)
	}

	function handleRemove(id: string) {
		saveExternalLinks(externalLinks.filter((l) => l.id !== id))
	}

	const existingCategories = Array.from(new Set(externalLinks.map((l) => l.category).filter(Boolean) as string[])).sort()

	const formContent = (
		<div className="grid gap-4 py-2">
			<div className="grid gap-2">
				<Label htmlFor="ext-label">
					<Trans>Label</Trans>
				</Label>
				<Input
					id="ext-label"
					placeholder="My Bookmark"
					value={formLabel}
					onChange={(e) => setFormLabel(e.target.value)}
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="ext-url">
					<Trans>URL</Trans>
				</Label>
				<Input
					id="ext-url"
					placeholder="https://example.com"
					value={formUrl}
					onChange={(e) => setFormUrl(e.target.value)}
				/>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="ext-icon">
					<Trans>Icon</Trans>
				</Label>
				<Select value={formIcon} onValueChange={setFormIcon}>
					<SelectTrigger id="ext-icon">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{ICON_OPTIONS.map((opt) => (
							<SelectItem key={opt.value} value={opt.value}>
								{opt.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<div className="grid gap-2">
				<Label htmlFor="ext-category">
					<Trans>Category</Trans>
				</Label>
				<div className="flex gap-2">
					<Input
						id="ext-category"
						placeholder="e.g. Tools, Media, Docs..."
						value={formCategory}
						onChange={(e) => setFormCategory(e.target.value)}
					/>
					{existingCategories.length > 0 && (
						<Select value={formCategory} onValueChange={setFormCategory}>
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
		</div>
	)

	return (
		<div>
			<div className="flex items-center justify-between mb-2">
				<div>
					<h3 className="text-lg font-medium flex items-center gap-2">
						<ExternalLinkIcon className="h-4 w-4" />
						<Trans>External Links</Trans>
					</h3>
					<p className="text-sm text-muted-foreground leading-relaxed mt-1">
						<Trans>Manage your favorite external links displayed on the dashboard.</Trans>
					</p>
				</div>
				<Button variant="outline" size="sm" className="flex items-center gap-1.5" onClick={openAdd}>
					<PlusIcon className="h-4 w-4" />
					<Trans>Add</Trans>
				</Button>
			</div>

			{externalLinks.length === 0 ? (
				<p className="text-sm text-muted-foreground italic py-4">
					<Trans>No external links yet. Click Add to create one.</Trans>
				</p>
			) : (
				<div className="border rounded-md divide-y">
					{externalLinks.map((link) => (
						<div key={link.id} className="flex items-center gap-3 px-3 py-2.5">
							<span className="text-xs text-muted-foreground uppercase tracking-wide w-14 shrink-0">
								{link.icon || "globe"}
							</span>
							<div className="flex-1 min-w-0">
								<div className="font-medium text-sm truncate">{link.label}</div>
								<div className="text-xs text-muted-foreground truncate">{link.url}</div>
								{link.category && (
									<div className="text-xs text-muted-foreground/70">{link.category}</div>
								)}
							</div>
							<div className="flex items-center gap-1 shrink-0">
								<Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(link)}>
									<PencilIcon className="h-3.5 w-3.5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-destructive hover:text-destructive"
									onClick={() => handleRemove(link.id)}
								>
									<TrashIcon className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Add Dialog */}
			<Dialog open={addOpen} onOpenChange={setAddOpen}>
				<DialogContent className="w-[90%] sm:max-w-md rounded-lg">
					<DialogHeader>
						<DialogTitle>
							<Trans>Add External Link</Trans>
						</DialogTitle>
					</DialogHeader>
					{formContent}
					<DialogFooter>
						<Button variant="outline" onClick={() => setAddOpen(false)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={handleAdd} disabled={!formLabel.trim() || !formUrl.trim()}>
							<Trans>Add</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Edit Dialog */}
			<Dialog open={!!editLink} onOpenChange={(open) => !open && setEditLink(null)}>
				<DialogContent className="w-[90%] sm:max-w-md rounded-lg">
					<DialogHeader>
						<DialogTitle>
							<Trans>Edit External Link</Trans>
						</DialogTitle>
					</DialogHeader>
					{formContent}
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditLink(null)}>
							<Trans>Cancel</Trans>
						</Button>
						<Button onClick={handleSaveEdit} disabled={!formLabel.trim() || !formUrl.trim()}>
							<Trans>Save</Trans>
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
