"use client"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Transaction {
  id: string
  transaction_type: string
  category: string
  amount: number
  description: string
  transaction_date: string
  payment_method?: string
}

interface TransactionsListProps {
  transactions: Transaction[]
  initialBalance: number
  currentBalance: number
}

export function TransactionsList({ transactions, initialBalance, currentBalance }: TransactionsListProps) {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    const handleExportCSV = () => {
      if (transactions.length === 0) {
        alert("No transactions to export")
        return
      }

      const headers = [
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
        "Payment Method",
        "Initial Balance",
        "Current Balance",
      ]
      const rows = transactions.map((t) => [
        t.transaction_date.slice(0, 10),
        t.transaction_type,
        t.category,
        t.description,
        t.amount.toFixed(2),
        t.payment_method || "",
        initialBalance.toFixed(2),
        currentBalance.toFixed(2),
      ])

      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    window.addEventListener("exportCSV", handleExportCSV)
    return () => window.removeEventListener("exportCSV", handleExportCSV)
  }, [transactions])

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allSelected = transactions.length > 0 && selected.size === transactions.length
  const someSelected = selected.size > 0 && selected.size < transactions.length

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(transactions.map((t) => t.id)))
    } else {
      setSelected(new Set())
    }
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const transaction_date = (fd.get("transaction_date") as string) || ""
    const transaction_type = (fd.get("transaction_type") as string) || ""
    const category = (fd.get("category") as string) || ""
    const description = (fd.get("description") as string) || ""
    const amountStr = (fd.get("amount") as string) || "0"
    const payment_methodRaw = (fd.get("payment_method") as string) || ""

    const updates: Partial<Transaction> = {
      transaction_date,
      transaction_type,
      category,
      description,
      amount: Math.abs(parseFloat(amountStr)),
      payment_method: payment_methodRaw || undefined,
    }

    const { error } = await supabase.from("transactions").update(updates).eq("id", id)
    if (!error) {
      router.refresh()
      const closeBtn = document.getElementById(`close-edit-${id}`) as HTMLButtonElement | null
      closeBtn?.click()
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id)

    if (!error) {
      router.refresh()
    }
  }

  if (transactions.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No transactions yet</p>
  }

  const formatDate = (value: string) => {
    if (!value) return ""
    return value.slice(0, 10)
  }

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export")
      return
    }
    const toExport = selected.size > 0 ? transactions.filter((t) => selected.has(t.id)) : transactions
    const headers = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Amount",
      "Payment Method",
      "Initial Balance",
      "Current Balance",
    ]
    const rows = toExport.map((t) => [
      t.transaction_date.slice(0, 10),
      t.transaction_type,
      t.category,
      t.description,
      t.amount.toFixed(2),
      t.payment_method || "",
      initialBalance.toFixed(2),
      currentBalance.toFixed(2),
    ])
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `transactions-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportPDF = () => {
    if (transactions.length === 0) {
      alert("No transactions to export")
      return
    }
    const win = window.open("", "_blank")
    if (!win) return
    const styles = `
      <style>
        body { font-family: Arial, sans-serif; padding: 16px; }
        h1 { font-size: 18px; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; font-size: 12px; text-align: left; }
        th { background: #f5f5f5; }
      </style>
    `
    const header = [
      "Date",
      "Type",
      "Category",
      "Description",
      "Amount",
      "Method",
      "Initial Balance",
      "Current Balance",
    ]
    const toExport = selected.size > 0 ? transactions.filter((t) => selected.has(t.id)) : transactions
    const rows = toExport
      .map((t) => {
        return `
          <tr>
            <td>${formatDate(t.transaction_date)}</td>
            <td>${t.transaction_type}</td>
            <td>${t.category}</td>
            <td>${t.description || ""}</td>
            <td>${t.amount.toFixed(2)}</td>
            <td>${t.payment_method || ""}</td>
            <td>${initialBalance.toFixed(2)}</td>
            <td>${currentBalance.toFixed(2)}</td>
          </tr>
        `
      })
      .join("")
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          ${styles}
          <title>Transactions Export</title>
        </head>
        <body>
          <h1>Transactions</h1>
          <table>
            <thead>
              <tr>${header.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 300); }<\/script>
        </body>
      </html>
    `
    win.document.open()
    win.document.write(html)
    win.document.close()
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end gap-2 mb-2">
        <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
        <Button variant="outline" size="sm" onClick={exportPDF}>Export PDF</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={someSelected ? "indeterminate" : allSelected}
                onCheckedChange={(checked) => toggleAll(Boolean(checked))}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Initial Balance</TableHead>
            <TableHead>Current Balance</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell className="w-10">
                <Checkbox
                  checked={selected.has(transaction.id)}
                  onCheckedChange={(checked) => toggleOne(transaction.id, Boolean(checked))}
                  aria-label={`Select transaction ${transaction.id}`}
                />
              </TableCell>
              <TableCell className="font-mono text-xs" title={transaction.id}>
                {transaction.id.slice(0, 5)}
              </TableCell>
              <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    transaction.transaction_type === "income"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {transaction.transaction_type}
                </span>
              </TableCell>
              <TableCell className="capitalize">{transaction.category}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell
                className={
                  transaction.transaction_type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"
                }
              >
                {transaction.transaction_type === "income" ? "+" : "-"}
                {transaction.amount.toFixed(2)}
              </TableCell>
              <TableCell className="capitalize">{transaction.payment_method}</TableCell>
              <TableCell>{initialBalance.toFixed(2)}</TableCell>
              <TableCell>{currentBalance.toFixed(2)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Edit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>Update the fields and save your changes.</DialogDescription>
                      </DialogHeader>
                      <form className="space-y-3" onSubmit={(e) => handleEditSubmit(e, transaction.id)}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label htmlFor={`date-${transaction.id}`}>Date</Label>
                            <Input
                              id={`date-${transaction.id}`}
                              name="transaction_date"
                              type="date"
                              defaultValue={transaction.transaction_date?.slice(0, 10)}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`type-${transaction.id}`}>Type</Label>
                            <select
                              id={`type-${transaction.id}`}
                              name="transaction_type"
                              defaultValue={transaction.transaction_type}
                              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="income">Income</option>
                              <option value="expense">Expense</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`category-${transaction.id}`}>Category</Label>
                            <Input
                              id={`category-${transaction.id}`}
                              name="category"
                              type="text"
                              defaultValue={transaction.category}
                              required
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor={`amount-${transaction.id}`}>Amount</Label>
                            <Input
                              id={`amount-${transaction.id}`}
                              name="amount"
                              type="number"
                              step="0.01"
                              defaultValue={transaction.amount}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`method-${transaction.id}`}>Payment Method</Label>
                          <Input
                            id={`method-${transaction.id}`}
                            name="payment_method"
                            type="text"
                            defaultValue={transaction.payment_method || ""}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor={`description-${transaction.id}`}>Description</Label>
                          <Textarea
                            id={`description-${transaction.id}`}
                            name="description"
                            defaultValue={transaction.description || ""}
                            rows={3}
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <button id={`close-edit-${transaction.id}`} className="hidden" />
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this transaction? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(transaction.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
