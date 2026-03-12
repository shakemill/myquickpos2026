import Link from "next/link"

export default function RestaurantTableNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-xl font-semibold text-foreground">Table ou établissement non trouvé</h1>
      <p className="text-sm text-muted-foreground text-center">
        Vérifiez le lien ou contactez l&apos;établissement.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Accueil
      </Link>
    </div>
  )
}
