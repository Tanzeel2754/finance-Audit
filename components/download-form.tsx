"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, CheckCircle2, AlertCircle } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"

export function DownloadForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    company_name: "",
    phone: "",
    country: "",
    product_version: "latest",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, country: value }))
  }

  const handleVersionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, product_version: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setStatus("idle")

    try {
      const { error } = await supabase.from("downloads").insert([formData])

      if (error) {
        setStatus("error")
        setMessage("Failed to register download. Please try again.")
        console.error("Supabase error:", error)
      } else {
        setStatus("success")
        setMessage("Download link sent to your email!")
        setFormData({
          email: "",
          company_name: "",
          phone: "",
          country: "",
          product_version: "latest",
        })
      }
    } catch (err) {
      setStatus("error")
      setMessage("An error occurred. Please try again.")
      console.error("Error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="download" className="py-20 sm:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Card className="border border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Download AuditPro</CardTitle>
              <CardDescription className="text-base">
                Fill in your details to get instant access to the latest version
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      placeholder="Your Company"
                      value={formData.company_name}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={formData.country} onValueChange={handleSelectChange} disabled={isLoading}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="SG">Singapore</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_version">Product Version</Label>
                  <Select value={formData.product_version} onValueChange={handleVersionChange} disabled={isLoading}>
                    <SelectTrigger id="product_version">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest (2024.1)</SelectItem>
                      <SelectItem value="2023.4">2023.4</SelectItem>
                      <SelectItem value="2023.3">2023.3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === "success" && (
                  <div className="flex gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
                  <Download className="h-4 w-4" />
                  {isLoading ? "Processing..." : "Download Now"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By downloading, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
