import Link from "next/link"

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-xl font-semibold text-foreground">Établissement non trouvé</h1>
      <p className="text-center text-sm text-muted-foreground">
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
