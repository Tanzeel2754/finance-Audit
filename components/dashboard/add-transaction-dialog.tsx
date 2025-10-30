"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddTransactionDialogProps {
  accountId: string
  onTransactionAdded: () => void
}

export function AddTransactionDialog({ accountId, onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    transaction_type: "expense",
    category: "food",
    amount: "",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
    payment_method: "cash",
  })
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const expenseCategories = [
    "food",
    "utilities",
    "rent",
    "transportation",
    "entertainment",
    "healthcare",
    "education",
    "shopping",
    "other",
  ]

  const incomeCategories = ["salary", "freelance", "investment", "bonus", "other"]

  const categories = formData.transaction_type === "income" ? incomeCategories : expenseCategories

  useEffect(() => {
    if (formData.transaction_type === "income") {
      if (!incomeCategories.includes(formData.category)) {
        setFormData((prev) => ({ ...prev, category: "salary" }))
      }
    } else {
      if (!expenseCategories.includes(formData.category)) {
        setFormData((prev) => ({ ...prev, category: "food" }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.transaction_type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        account_id: accountId,
        transaction_type: formData.transaction_type,
        category: formData.category,
        amount: Number.parseFloat(formData.amount),
        description: formData.description,
        transaction_date: formData.transaction_date,
        payment_method: formData.payment_method,
      })

      if (error) {
        console.error("Error creating transaction:", error)
      } else {
        setOpen(false)
        setFormData({
          transaction_type: "expense",
          category: "food",
          amount: "",
          description: "",
          transaction_date: new Date().toISOString().split("T")[0],
          payment_method: "cash",
        })
        onTransactionAdded()
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Transaction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
          <DialogDescription>Record a new income or expense</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select
              value={formData.transaction_type}
              onValueChange={(value) =>
                (console.log("Type change:", value),
                setFormData((prev) => ({
                  ...prev,
                  transaction_type: value,
                })))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <Input
              placeholder="e.g., Grocery shopping"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              value={formData.transaction_date}
              onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Payment Method</label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Transaction"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
