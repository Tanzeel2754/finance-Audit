"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Account {
  id: string
  account_name: string
  current_balance: number
  currency: string
}

interface Transaction {
  id: string
  transaction_type: string
  category: string
  amount: number
  transaction_date: string
}

interface ReportsViewProps {
  accounts: Account[]
  transactions: Transaction[]
}

const COLORS = ["#0a4f3d", "#65a30d", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

export function ReportsView({ accounts, transactions }: ReportsViewProps) {
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.transaction_type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalBalance = accounts.reduce((sum, a) => sum + a.current_balance, 0)

    const categoryExpenses = transactions
      .filter((t) => t.transaction_type === "expense")
      .reduce(
        (acc, t) => {
          const existing = acc.find((item) => item.name === t.category)
          if (existing) {
            existing.value += t.amount
          } else {
            acc.push({ name: t.category, value: t.amount })
          }
          return acc
        },
        [] as Array<{ name: string; value: number }>,
      )

    const monthlyData = transactions.reduce(
      (acc, t) => {
        const date = new Date(t.transaction_date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const existing = acc.find((item) => item.month === monthKey)

        if (existing) {
          if (t.transaction_type === "income") {
            existing.income += t.amount
          } else {
            existing.expense += t.amount
          }
        } else {
          acc.push({
            month: monthKey,
            income: t.transaction_type === "income" ? t.amount : 0,
            expense: t.transaction_type === "expense" ? t.amount : 0,
          })
        }
        return acc
      },
      [] as Array<{ month: string; income: number; expense: number }>,
    )

    return {
      totalIncome,
      totalExpenses,
      totalBalance,
      categoryExpenses,
      monthlyData: monthlyData.sort((a, b) => a.month.localeCompare(b.month)),
    }
  }, [accounts, transactions])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.totalExpenses.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats.totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Income vs Expenses</CardTitle>
          <CardDescription>Track your income and expenses over time</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="income" fill="#65a30d" name="Income" />
                <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <CardDescription>See where your money is going</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.categoryExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryExpenses}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(2)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">No expense data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
          <CardDescription>Overview of all your accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {accounts.length > 0 ? (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                  </div>
                  <p className="font-bold">
                    {account.currency} {account.current_balance.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No accounts available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
