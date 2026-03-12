import type { Metadata } from "next"

type Props = { params: Promise<{ establishmentSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { establishmentSlug } = await params
  const slug = encodeURIComponent(establishmentSlug)

  return {
    title: "MyQuickPOS - Tablet",
    manifest: `/api/manifest/tablet/${slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "MyQuickPOS",
    },
  }
}

export default function RestaurantTabletLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
