"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Star,
  Gift,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  Percent,
  Tag,
  Zap,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { updateLoyalty } from "@/app/actions/loyalty"

interface LoyaltyTier {
  id: string
  name: string
  pointsRequired: number
  benefits: string[]
  discount: number
  color: string
  icon: string
}

interface LoyaltyProgram {
  pointsPerDollar: number
  pointsExpiry: number
  members: number
  totalPoints: number
  redemptionRate: number
  active: boolean
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  value: number
  available: number
  redeemed: number
  active: boolean
  type: "discount" | "product" | "service"
}

const TIER_COLORS: Record<string, string> = {
  bronze: "text-amber-600 bg-amber-100 dark:bg-amber-950",
  silver: "text-slate-500 bg-slate-100 dark:bg-slate-800",
  gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
  platinum: "text-purple-600 bg-purple-100 dark:bg-purple-950",
}

function normalizeTier(raw: unknown): LoyaltyTier {
  const r = raw as Record<string, unknown>
  const icon = (r.icon as string) ?? "bronze"
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    pointsRequired: Number(r.pointsRequired ?? 0),
    benefits: Array.isArray(r.benefits) ? r.benefits.map(String) : [],
    discount: Number(r.discount ?? 0),
    color: (r.color as string) ?? TIER_COLORS[icon] ?? TIER_COLORS.bronze,
    icon,
  }
}

function normalizeReward(raw: unknown): Reward {
  const r = raw as Record<string, unknown>
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    description: String(r.description ?? ""),
    pointsCost: Number(r.pointsCost ?? 0),
    value: Number(r.value ?? 0),
    available: Number(r.available ?? 0),
    redeemed: Number(r.redeemed ?? 0),
    active: r.active !== false,
    type: (r.type as Reward["type"]) ?? "discount",
  }
}

export interface LoyaltyPageClientProps {
  initialTiers: unknown[]
  initialRewards: unknown[]
  initialProgram: LoyaltyProgram
  pointsPerEuro: number
  isActive: boolean
}

export function LoyaltyPageClient({
  initialTiers,
  initialRewards,
  initialProgram,
  pointsPerEuro,
  isActive,
}: LoyaltyPageClientProps) {
  const router = useRouter()
  const [tiers, setTiers] = useState<LoyaltyTier[]>(() =>
    initialTiers.map(normalizeTier).filter((t) => t.id)
  )
  const [rewards, setRewards] = useState<Reward[]>(() =>
    initialRewards.map(normalizeReward).filter((r) => r.id)
  )
  const [programActive, setProgramActive] = useState(isActive)
  const [pointsPerDollar, setPointsPerDollar] = useState(pointsPerEuro)
  const [createTierOpen, setCreateTierOpen] = useState(false)
  const [createRewardOpen, setCreateRewardOpen] = useState(false)
  const [editRewardOpen, setEditRewardOpen] = useState(false)
  const [editTierOpen, setEditTierOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTiers(initialTiers.map(normalizeTier).filter((t) => t.id))
    setRewards(initialRewards.map(normalizeReward).filter((r) => r.id))
  }, [initialTiers, initialRewards])

  useEffect(() => {
    setProgramActive(isActive)
    setPointsPerDollar(pointsPerEuro)
  }, [isActive, pointsPerEuro])

  const program: LoyaltyProgram = useMemo(
    () => ({
      ...initialProgram,
      active: programActive,
      pointsPerDollar,
    }),
    [initialProgram, programActive, pointsPerDollar]
  )

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setEditRewardOpen(true)
  }

  const handleEditTier = (tier: LoyaltyTier) => {
    setEditingTier(tier)
    setEditTierOpen(true)
  }

  const handleSaveReward = () => {
    setEditRewardOpen(false)
    setCreateRewardOpen(false)
    setEditingReward(null)
  }

  const handleSaveTier = () => {
    setEditTierOpen(false)
    setCreateTierOpen(false)
    setEditingTier(null)
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    const r = await updateLoyalty({
      pointsPerEuro: pointsPerDollar,
      isActive: programActive,
    })
    setSaving(false)
    if (r.success) router.refresh()
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Loyalty Programs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage rewards, tiers, and customer incentives
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Zap className="h-4 w-4" />
          Create Program
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-foreground mt-1">{program.members.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Points</p>
              <p className="text-2xl font-bold text-foreground mt-1">{program.totalPoints.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <Star className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Redemption Rate</p>
              <p className="text-2xl font-bold text-foreground mt-1">{program.redemptionRate}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Points per $</p>
              <p className="text-2xl font-bold text-foreground mt-1">{program.pointsPerDollar}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-all duration-300 group-hover:scale-110">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="tiers" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Membership Tiers</h2>
            <Button onClick={() => setCreateTierOpen(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Tier
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="group relative rounded-xl border-2 border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:border-primary/40 hover:shadow-xl"
              >
                <div className="absolute -top-3 -right-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-card border border-border text-muted-foreground hover:text-card-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTier(tier)}>
                        <Pencil className="h-4 w-4" />
                        Edit Tier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete Tier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", tier.color)}>
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tier.pointsRequired === 0 ? "Starting tier" : `${tier.pointsRequired.toLocaleString()} pts`}
                      </p>
                    </div>
                  </div>
                  {tier.discount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">{tier.discount}% Discount</span>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Available Rewards</h2>
            <Button onClick={() => setCreateRewardOpen(true)} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              Add Reward
            </Button>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Reward</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Points Cost</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">Available</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden xl:table-cell">Redeemed</th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Gift className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{reward.name}</p>
                            <p className="text-xs text-muted-foreground">{reward.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                          <Tag className="h-3 w-3" />
                          {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-foreground">{reward.pointsCost.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="font-semibold text-foreground">{formatCurrency(reward.value)}</span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className="text-muted-foreground">{reward.available}</span>
                      </td>
                      <td className="px-4 py-4 hidden xl:table-cell">
                        <span className="text-muted-foreground">{reward.redeemed}</span>
                      </td>
                      <td className="px-4 py-4">
                        {reward.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-card-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditReward(reward)}>
                              <Pencil className="h-4 w-4" />
                              Edit Reward
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {reward.active ? (
                                <><XCircle className="h-4 w-4" /> Deactivate</>
                              ) : (
                                <><CheckCircle2 className="h-4 w-4" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Delete Reward
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Program Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Program Status</Label>
                  <p className="text-sm text-muted-foreground">Enable or disable the loyalty program</p>
                </div>
                <Switch checked={programActive} onCheckedChange={setProgramActive} />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-semibold">Points Configuration</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="points-per-dollar">Points per Dollar Spent</Label>
                    <Input
                      id="points-per-dollar"
                      type="number"
                      value={pointsPerDollar}
                      onChange={(e) => setPointsPerDollar(parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points-expiry">Points Expiry (Days)</Label>
                    <Input id="points-expiry" type="number" value={program.pointsExpiry} min={0} readOnly className="bg-muted" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => router.refresh()}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSettings} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog
        open={createRewardOpen || editRewardOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateRewardOpen(false)
            setEditRewardOpen(false)
            setEditingReward(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingReward ? "Edit Reward" : "Create New Reward"}</DialogTitle>
            <DialogDescription>
              {editingReward ? "Update reward details below." : "Add a new reward to your loyalty program."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reward-name">Reward Name</Label>
              <Input id="reward-name" placeholder="e.g., $5 Off, Free Coffee" defaultValue={editingReward?.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward-description">Description</Label>
              <Input id="reward-description" placeholder="Brief description" defaultValue={editingReward?.description} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-type">Reward Type</Label>
                <select
                  id="reward-type"
                  defaultValue={editingReward?.type ?? "discount"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="discount">Discount</option>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-points">Points Cost</Label>
                <Input id="reward-points" type="number" placeholder="500" defaultValue={editingReward?.pointsCost} min={0} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-value">Value ($)</Label>
                <Input id="reward-value" type="number" step={0.01} placeholder="5.00" defaultValue={editingReward?.value} min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-available">Available Quantity</Label>
                <Input id="reward-available" type="number" placeholder="100" defaultValue={editingReward?.available} min={0} />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">Make this reward available for redemption</p>
              </div>
              <Switch defaultChecked={editingReward?.active ?? true} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateRewardOpen(false); setEditRewardOpen(false); setEditingReward(null) }}>
              Cancel
            </Button>
            <Button onClick={handleSaveReward}>{editingReward ? "Save Changes" : "Create Reward"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={createTierOpen || editTierOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCreateTierOpen(false)
            setEditTierOpen(false)
            setEditingTier(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingTier ? "Edit Tier" : "Create New Tier"}</DialogTitle>
            <DialogDescription>
              {editingTier ? "Update tier details below." : "Add a new membership tier to your program."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tier-name">Tier Name</Label>
              <Input id="tier-name" placeholder="e.g., Gold, Platinum" defaultValue={editingTier?.name} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tier-points">Points Required</Label>
                <Input id="tier-points" type="number" placeholder="1000" defaultValue={editingTier?.pointsRequired} min={0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier-discount">Discount (%)</Label>
                <Input id="tier-discount" type="number" placeholder="10" defaultValue={editingTier?.discount} min={0} max={100} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-color">Tier Color</Label>
              <select
                id="tier-color"
                defaultValue={editingTier?.color ?? "text-amber-600 bg-amber-100 dark:bg-amber-950"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="text-amber-600 bg-amber-100 dark:bg-amber-950">Bronze (Amber)</option>
                <option value="text-slate-500 bg-slate-100 dark:bg-slate-800">Silver (Slate)</option>
                <option value="text-yellow-600 bg-yellow-100 dark:bg-yellow-950">Gold (Yellow)</option>
                <option value="text-purple-600 bg-purple-100 dark:bg-purple-950">Platinum (Purple)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-benefits">Benefits (one per line)</Label>
              <textarea
                id="tier-benefits"
                rows={4}
                placeholder="Earn 1.5 points per $1"
                defaultValue={editingTier?.benefits.join("\n")}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateTierOpen(false); setEditTierOpen(false); setEditingTier(null) }}>
              Cancel
            </Button>
            <Button onClick={handleSaveTier}>{editingTier ? "Save Changes" : "Create Tier"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
