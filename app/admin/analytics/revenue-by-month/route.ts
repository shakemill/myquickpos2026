import { NextResponse } from "next/server"
import { getTenantId } from "@/lib/auth"
import { analyticsRepository } from "@/lib/repositories/analytics.repository"

export async function GET(request: Request) {
  const tenantId = await getTenantId()
  if (!tenantId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const yearParam = searchParams.get("year")
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()
  if (Number.isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 })
  }
  const data = await analyticsRepository.revenueByMonth(tenantId, year)
  return NextResponse.json(data)
}
