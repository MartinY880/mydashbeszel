import { t } from "@lingui/core/macro"
import PocketBase from "pocketbase"
import { basePath } from "@/components/router"
import { toast } from "@/components/ui/use-toast"
import type { ChartTimes, QuickLink, UserSettings } from "@/types"
import { $alerts, $allSystemsById, $allSystemsByName, $quickLinks, $userSettings } from "./stores"
import { chartTimeData } from "./utils"

/** PocketBase JS Client */
export const pb = new PocketBase(basePath)

export const isAdmin = () => pb.authStore.record?.role === "admin"
export const isReadOnlyUser = () => pb.authStore.record?.role === "readonly"

export const verifyAuth = () => {
	pb.collection("users")
		.authRefresh()
		.catch(() => {
			logOut()
			toast({
				title: t`Failed to authenticate`,
				description: t`Please log in again`,
				variant: "destructive",
			})
		})
}

/** Logs the user out by clearing the auth store and unsubscribing from realtime updates. */
export function logOut() {
	$allSystemsByName.set({})
	$allSystemsById.set({})
	$alerts.set({})
	$userSettings.set({} as UserSettings)
	$quickLinks.set([])
	sessionStorage.setItem("lo", "t") // prevent auto login on logout
	pb.authStore.clear()
	pb.realtime.unsubscribe()
}

/** Fetch or create user settings in database */
export async function updateUserSettings() {
	try {
		const req = await pb.collection("user_settings").getFirstListItem("", { fields: "id,settings" })
		$userSettings.set(req.settings)
		// Populate quick links from server
		const serverLinks: QuickLink[] = req.settings?.quickLinks ?? []
		// Migrate any quick links from localStorage (one-time)
		const localRaw = localStorage.getItem("besz-quick-links")
		if (localRaw) {
			try {
				const localLinks = JSON.parse(localRaw) as QuickLink[]
				if (localLinks.length > 0) {
					const existingIds = new Set(serverLinks.map((l) => l.id))
					const newLinks = localLinks.filter((l) => !existingIds.has(l.id))
					if (newLinks.length > 0) {
						const merged = [...serverLinks, ...newLinks]
						$quickLinks.set(merged)
						// Save merged links to server
						await pb.collection("user_settings").update(req.id, {
							settings: { ...req.settings, quickLinks: merged },
						})
					} else {
						$quickLinks.set(serverLinks)
					}
				} else {
					$quickLinks.set(serverLinks)
				}
			} catch {
				$quickLinks.set(serverLinks)
			}
			localStorage.removeItem("besz-quick-links")
		} else {
			$quickLinks.set(serverLinks)
		}
		return
	} catch (e) {
		console.error("get settings", e)
	}
	// create user settings if error fetching existing
	try {
		const createdSettings = await pb.collection("user_settings").create({ user: pb.authStore.record?.id })
		$userSettings.set(createdSettings.settings)
		$quickLinks.set([])
	} catch (e) {
		console.error("create settings", e)
	}
}

/** Save quick links to server-side user settings */
export async function saveQuickLinks(links: QuickLink[]) {
	$quickLinks.set(links)
	try {
		const req = await pb.collection("user_settings").getFirstListItem("", { fields: "id,settings" })
		await pb.collection("user_settings").update(req.id, {
			settings: { ...req.settings, quickLinks: links },
		})
	} catch (e) {
		console.error("save quick links", e)
	}
}

export function getPbTimestamp(timeString: ChartTimes, d?: Date) {
	d ||= chartTimeData[timeString].getOffset(new Date())
	const year = d.getUTCFullYear()
	const month = String(d.getUTCMonth() + 1).padStart(2, "0")
	const day = String(d.getUTCDate()).padStart(2, "0")
	const hours = String(d.getUTCHours()).padStart(2, "0")
	const minutes = String(d.getUTCMinutes()).padStart(2, "0")
	const seconds = String(d.getUTCSeconds()).padStart(2, "0")

	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
