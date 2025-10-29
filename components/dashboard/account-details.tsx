"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TransactionsList } from "./transactions-list"
import { AddTransactionDialog } from "./add-transaction-dialog"
import { TransactionFilters } from "./transaction-filters"
import Link from "next/link"

interface Account {
  id: string
  account_name: string
  account_type: string
  bank_name?: string
  current_balance: number
  currency: string
}

interface Transaction {
  id: string
  transaction_type: string
  category: string
  amount: number
  description: string
  transaction_date: string
  payment_method?: string
}

interface AccountDetailsProps {
  account: Account
  transactions: Transaction[]
}

export function AccountDetails({ account, transactions }: AccountDetailsProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  })

  const handleTransactionAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const filteredTransactions = transactions.filter((t) => {
    if (!dateRange.from && !dateRange.to) return true
    const transDate = new Date(t.transaction_date)
    if (dateRange.from && transDate < new Date(dateRange.from)) return false
    if (dateRange.to && transDate > new Date(dateRange.to)) return false
    return true
  })

  const income = filteredTransactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = filteredTransactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <Link href="/dashboard" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Accounts
          </Link>
          <h1 className="text-3xl font-bold">{account.account_name}</h1>
          <p className="text-muted-foreground mt-2">{account.account_type}</p>
        </div>
        <AddTransactionDialog accountId={account.id} onTransactionAdded={handleTransactionAdded} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {account.currency} {account.current_balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {account.currency} {income.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {account.currency} {expenses.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>All transactions for this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TransactionFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
          <TransactionsList key={refreshKey} transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
