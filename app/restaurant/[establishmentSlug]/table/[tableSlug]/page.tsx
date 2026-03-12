import { redirect } from "next/navigation"

/** Old tablet URL per table: redirect to establishment-only URL so bookmarks and PWA still work. */
export default async function RestaurantTableRedirect({
  params,
}: {
  params: Promise<{ establishmentSlug: string; tableSlug: string }>
}) {
  const { establishmentSlug } = await params
  const decoded = decodeURIComponent(establishmentSlug)
  redirect(`/restaurant/${encodeURIComponent(decoded)}`)
}
