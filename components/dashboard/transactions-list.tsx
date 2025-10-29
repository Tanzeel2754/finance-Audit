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
}

export function TransactionsList({ transactions }: TransactionsListProps) {
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

      const headers = ["Date", "Type", "Category", "Description", "Amount", "Payment Method"]
      const rows = transactions.map((t) => [
        new Date(t.transaction_date).toLocaleDateString(),
        t.transaction_type,
        t.category,
        t.description,
        t.amount.toFixed(2),
        t.payment_method || "",
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
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
