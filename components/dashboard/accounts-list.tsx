"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Account {
  id: string
  account_name: string
  account_type: string
  bank_name?: string
  current_balance: number
  currency: string
}

interface AccountsListProps {
  accounts: Account[]
  computedBalances?: Record<string, number>
}

export function AccountsList({ accounts, computedBalances }: AccountsListProps) {
  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="pt-8 text-center">
          <p className="text-muted-foreground mb-4">No accounts yet. Create your first account to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((account) => (
        <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
            <CardHeader>
              <CardTitle className="text-lg">{account.account_name}</CardTitle>
              <CardDescription>{account.account_type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {account.bank_name && <p className="text-sm text-muted-foreground">{account.bank_name}</p>}
                <p className="text-2xl font-bold">
                  {account.currency}{" "}
                  {(computedBalances && computedBalances[account.id] !== undefined
                    ? computedBalances[account.id]
                    : account.current_balance
                  ).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
