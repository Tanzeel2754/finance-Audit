import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary to-background py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <span className="text-sm font-medium text-primary">New Release</span>
            <span className="text-xs text-muted-foreground">Version 2024.1 Available</span>
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
            Professional Audit & Accounts Software
          </h1>

          <p className="text-balance text-lg text-muted-foreground mb-8 sm:text-xl">
            Streamline your audit processes, manage accounts efficiently, and ensure compliance with powerful, intuitive
            software designed for modern accounting firms.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="gap-2">
              <Link href="#download">
                Download Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Enterprise Ready</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">Secure & Compliant</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium text-foreground">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
