"use client"
import { useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
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
    const rows = transactions
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
