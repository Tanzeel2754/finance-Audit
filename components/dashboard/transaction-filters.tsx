"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface TransactionFiltersProps {
  dateRange: { from: string; to: string }
  onDateRangeChange: (range: { from: string; to: string }) => void
}

export function TransactionFilters({ dateRange, onDateRangeChange }: TransactionFiltersProps) {
  const handleExportCSV = () => {
    // CSV export logic will be added in the transactions list component
    const event = new CustomEvent("exportCSV")
    window.dispatchEvent(event)
  }

  return (
    <Card className="p-4 bg-muted/50">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">From Date</label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">To Date</label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
            />
          </div>
          <Button variant="outline" onClick={() => onDateRangeChange({ from: "", to: "" })} className="md:w-auto">
            Clear Filters
          </Button>
          <Button onClick={handleExportCSV} className="md:w-auto">
            Export CSV
          </Button>
        </div>
      </div>
    </Card>
  )
}
