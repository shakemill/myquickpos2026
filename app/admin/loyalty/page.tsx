"use client"

import { useState } from "react"
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

interface LoyaltyTier {
  id: string
  name: string
  pointsRequired: number
  benefits: string[]
  discount: number
  color: string
  icon: "bronze" | "silver" | "gold" | "platinum"
}

interface LoyaltyProgram {
  id: string
  name: string
  description: string
  active: boolean
  pointsPerDollar: number
  pointsExpiry: number // days
  members: number
  totalPoints: number
  redemptionRate: number
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

const mockTiers: LoyaltyTier[] = [
  {
    id: "1",
    name: "Bronze",
    pointsRequired: 0,
    benefits: ["Earn 1 point per $1", "Birthday reward"],
    discount: 0,
    color: "text-amber-600 bg-amber-100 dark:bg-amber-950",
    icon: "bronze",
  },
  {
    id: "2",
    name: "Silver",
    pointsRequired: 500,
    benefits: ["Earn 1.25 points per $1", "5% discount", "Priority support"],
    discount: 5,
    color: "text-slate-500 bg-slate-100 dark:bg-slate-800",
    icon: "silver",
  },
  {
    id: "3",
    name: "Gold",
    pointsRequired: 2000,
    benefits: ["Earn 1.5 points per $1", "10% discount", "Free delivery", "Early access"],
    discount: 10,
    color: "text-yellow-600 bg-yellow-100 dark:bg-yellow-950",
    icon: "gold",
  },
  {
    id: "4",
    name: "Platinum",
    pointsRequired: 5000,
    benefits: [
      "Earn 2 points per $1",
      "15% discount",
      "Free delivery",
      "VIP support",
      "Exclusive events",
    ],
    discount: 15,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-950",
    icon: "platinum",
  },
]

const mockPrograms: LoyaltyProgram[] = [
  {
    id: "1",
    name: "QuickRewards",
    description: "Earn points on every purchase and redeem for rewards",
    active: true,
    pointsPerDollar: 1,
    pointsExpiry: 365,
    members: 4200,
    totalPoints: 125000,
    redemptionRate: 32,
  },
]

const mockRewards: Reward[] = [
  {
    id: "1",
    name: "$5 Off",
    description: "$5 discount on your next purchase",
    pointsCost: 500,
    value: 5,
    available: 100,
    redeemed: 45,
    active: true,
    type: "discount",
  },
  {
    id: "2",
    name: "$10 Off",
    description: "$10 discount on your next purchase",
    pointsCost: 1000,
    value: 10,
    available: 50,
    redeemed: 28,
    active: true,
    type: "discount",
  },
  {
    id: "3",
    name: "Free Coffee",
    description: "Get a free regular coffee",
    pointsCost: 300,
    value: 3.5,
    available: 200,
    redeemed: 156,
    active: true,
    type: "product",
  },
  {
    id: "4",
    name: "Free Dessert",
    description: "Choose any dessert on the house",
    pointsCost: 400,
    value: 6,
    available: 150,
    redeemed: 89,
    active: true,
    type: "product",
  },
]

export default function LoyaltyProgramsPage() {
  const [programs] = useState<LoyaltyProgram[]>(mockPrograms)
  const [tiers, setTiers] = useState<LoyaltyTier[]>(mockTiers)
  const [rewards, setRewards] = useState<Reward[]>(mockRewards)
  const [createTierOpen, setCreateTierOpen] = useState(false)
  const [createRewardOpen, setCreateRewardOpen] = useState(false)
  const [editRewardOpen, setEditRewardOpen] = useState(false)
  const [editTierOpen, setEditTierOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [editingTier, setEditingTier] = useState<LoyaltyTier | null>(null)

  const program = programs[0] // For now, showing single program

  const handleEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setEditRewardOpen(true)
  }

  const handleEditTier = (tier: LoyaltyTier) => {
    setEditingTier(tier)
    setEditTierOpen(true)
  }

  const handleSaveReward = () => {
    // In real app, this would save to backend
    setEditRewardOpen(false)
    setCreateRewardOpen(false)
    setEditingReward(null)
  }

  const handleSaveTier = () => {
    // In real app, this would save to backend
    setEditTierOpen(false)
    setCreateTierOpen(false)
    setEditingTier(null)
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
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

      {/* Program Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Members</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {program.members.toLocaleString()}
              </p>
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
              <p className="text-2xl font-bold text-foreground mt-1">
                {program.totalPoints.toLocaleString()}
              </p>
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

      {/* Tabs */}
      <Tabs defaultValue="tiers" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Tiers Tab */}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-card border border-border text-muted-foreground hover:text-card-foreground"
                      >
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
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl",
                        tier.color
                      )}
                    >
                      <Award className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tier.pointsRequired === 0
                          ? "Starting tier"
                          : `${tier.pointsRequired.toLocaleString()} pts`}
                      </p>
                    </div>
                  </div>

                  {tier.discount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2">
                      <Percent className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">
                        {tier.discount}% Discount
                      </span>
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

        {/* Rewards Tab */}
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
                    <th className="px-4 py-3 text-left font-semibold text-foreground">
                      Points Cost
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden md:table-cell">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden lg:table-cell">
                      Available
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground hidden xl:table-cell">
                      Redeemed
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((reward) => (
                    <tr
                      key={reward.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors"
                    >
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
                          <span className="font-semibold text-foreground">
                            {reward.pointsCost.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="font-semibold text-foreground">
                          {formatCurrency(reward.value)}
                        </span>
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-card-foreground"
                            >
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
                                <>
                                  <XCircle className="h-4 w-4" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  Activate
                                </>
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Program Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="space-y-1">
                  <Label className="text-base font-semibold">Program Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the loyalty program
                  </p>
                </div>
                <Switch checked={program.active} />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Points Configuration</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="points-per-dollar">Points per Dollar Spent</Label>
                    <Input
                      id="points-per-dollar"
                      type="number"
                      defaultValue={program.pointsPerDollar}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points-expiry">Points Expiry (Days)</Label>
                    <Input
                      id="points-expiry"
                      type="number"
                      defaultValue={program.pointsExpiry}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Program Information</Label>
                <div className="space-y-2">
                  <Label htmlFor="program-name">Program Name</Label>
                  <Input id="program-name" defaultValue={program.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-description">Description</Label>
                  <Input id="program-description" defaultValue={program.description} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Reward Dialog */}
      <Dialog open={createRewardOpen || editRewardOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateRewardOpen(false)
          setEditRewardOpen(false)
          setEditingReward(null)
        }
      }}>
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
              <Input
                id="reward-name"
                placeholder="e.g., $5 Off, Free Coffee"
                defaultValue={editingReward?.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward-description">Description</Label>
              <Input
                id="reward-description"
                placeholder="Brief description of the reward"
                defaultValue={editingReward?.description}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-type">Reward Type</Label>
                <select
                  id="reward-type"
                  defaultValue={editingReward?.type || "discount"}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="discount">Discount</option>
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-points">Points Cost</Label>
                <Input
                  id="reward-points"
                  type="number"
                  placeholder="500"
                  defaultValue={editingReward?.pointsCost}
                  min="0"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="reward-value">Value ($)</Label>
                <Input
                  id="reward-value"
                  type="number"
                  step="0.01"
                  placeholder="5.00"
                  defaultValue={editingReward?.value}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reward-available">Available Quantity</Label>
                <Input
                  id="reward-available"
                  type="number"
                  placeholder="100"
                  defaultValue={editingReward?.available}
                  min="0"
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this reward available for redemption
                </p>
              </div>
              <Switch defaultChecked={editingReward?.active ?? true} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateRewardOpen(false)
                setEditRewardOpen(false)
                setEditingReward(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReward}>
              {editingReward ? "Save Changes" : "Create Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Tier Dialog */}
      <Dialog open={createTierOpen || editTierOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateTierOpen(false)
          setEditTierOpen(false)
          setEditingTier(null)
        }
      }}>
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
              <Input
                id="tier-name"
                placeholder="e.g., Gold, Platinum"
                defaultValue={editingTier?.name}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tier-points">Points Required</Label>
                <Input
                  id="tier-points"
                  type="number"
                  placeholder="1000"
                  defaultValue={editingTier?.pointsRequired}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier-discount">Discount (%)</Label>
                <Input
                  id="tier-discount"
                  type="number"
                  placeholder="10"
                  defaultValue={editingTier?.discount}
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-color">Tier Color</Label>
              <select
                id="tier-color"
                defaultValue={editingTier?.color || "text-amber-600 bg-amber-100 dark:bg-amber-950"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="text-amber-600 bg-amber-100 dark:bg-amber-950">Bronze (Amber)</option>
                <option value="text-slate-500 bg-slate-100 dark:bg-slate-800">Silver (Slate)</option>
                <option value="text-yellow-600 bg-yellow-100 dark:bg-yellow-950">Gold (Yellow)</option>
                <option value="text-purple-600 bg-purple-100 dark:bg-purple-950">Platinum (Purple)</option>
                <option value="text-blue-600 bg-blue-100 dark:bg-blue-950">Sapphire (Blue)</option>
                <option value="text-emerald-600 bg-emerald-100 dark:bg-emerald-950">Emerald (Green)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tier-benefits">Benefits (one per line)</Label>
              <textarea
                id="tier-benefits"
                rows={4}
                placeholder="Earn 1.5 points per $1&#10;10% discount&#10;Free delivery"
                defaultValue={editingTier?.benefits.join('\n')}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateTierOpen(false)
                setEditTierOpen(false)
                setEditingTier(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTier}>
              {editingTier ? "Save Changes" : "Create Tier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
