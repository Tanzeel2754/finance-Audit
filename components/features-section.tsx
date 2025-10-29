import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Lock, Users, Zap, FileText, TrendingUp } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time insights and comprehensive reporting for better decision making.",
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "Enterprise-grade encryption and compliance with international standards.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamless workflow management with role-based access controls.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance for handling large datasets efficiently.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    description: "Generate professional audit reports with a single click.",
  },
  {
    icon: TrendingUp,
    title: "Scalable Solution",
    description: "Grows with your business from startups to enterprises.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Powerful Features for Modern Auditors
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to manage audits and accounts with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
