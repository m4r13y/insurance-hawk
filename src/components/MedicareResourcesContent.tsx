import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TokensIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  ChatBubbleIcon,
  GearIcon,
  PersonIcon,
  FileTextIcon,
  MobileIcon
} from '@radix-ui/react-icons';

const tools = [
  {
    title: "Premium Calculator",
    description: "Estimate your Medicare costs",
    icon: TokensIcon,
    badge: "Popular",
    color: "bg-blue-500"
  },
  {
    title: "Plan Finder",
    description: "Search plans in your area",
    icon: MagnifyingGlassIcon,
    badge: "New",
    color: "bg-green-500"
  },
  {
    title: "Enrollment Dates",
    description: "Important Medicare deadlines",
    icon: CalendarIcon,
    color: "bg-purple-500"
  },
  {
    title: "Provider Search",
    description: "Find doctors and hospitals",
    icon: PersonIcon,
    color: "bg-orange-500"
  }
];

const supportOptions = [
  {
    title: "Live Chat Support",
    description: "Get instant help from Medicare experts",
    icon: ChatBubbleIcon,
    available: "Mon-Fri 8AM-8PM EST"
  },
  {
    title: "Phone Consultation",
    description: "Schedule a call with a licensed agent",
    icon: MobileIcon,
    available: "Available 7 days a week"
  },
  {
    title: "Local Agent Finder",
    description: "Meet with an agent in your area",
    icon: PersonIcon,
    available: "Nationwide coverage"
  }
];

export default function MedicareResourcesContent() {
  return (
    <div>
      {/* Section Header */}
      <section className="py-8 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">
              Medicare Resources & Tools
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Helpful tools, calculators, and support resources to guide you through 
              your Medicare journey. Get personalized assistance when you need it.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
        {/* Tools & Calculators */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Tools & Calculators</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="border !border-border hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg ${tool.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" className="w-full">
                    Launch Tool
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Support & Assistance */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Get Personal Support</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <Card key={index} className="border !border-border">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                      <option.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-4">{option.available}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Reference */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-6">Quick Reference</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border !border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Important Dates for 2025
                </CardTitle>
                <CardDescription>
                  Key Medicare enrollment periods and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "Oct 15 - Dec 7", event: "Annual Open Enrollment" },
                    { date: "Jan 1 - Mar 31", event: "Medicare Advantage Open Enrollment" },
                    { date: "3 months before 65", event: "Initial Enrollment begins" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.date}</span>
                      <span className="text-muted-foreground">{item.event}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border !border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TokensIcon className="w-5 h-5" />
                  2025 Medicare Costs
                </CardTitle>
                <CardDescription>
                  Standard Medicare premiums and deductibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { item: "Part B Premium", cost: "$174.70/month" },
                    { item: "Part B Deductible", cost: "$240/year" },
                    { item: "Part A Deductible", cost: "$1,632/benefit period" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.item}</span>
                      <span className="text-muted-foreground">{item.cost}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Downloads & Forms */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Downloads & Forms</h3>
          <Card className="border !border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" />
                Helpful Documents
              </CardTitle>
              <CardDescription>
                Important forms and informational documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Medicare & You Handbook",
                  "Medigap Comparison Chart",
                  "Medicare Advantage Checklist",
                  "Prescription Drug Plan Worksheet",
                  "Medicare Appeal Form",
                  "Provider Directory Template"
                ].map((document, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    className="justify-start h-auto py-3"
                  >
                    <FileTextIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-left">{document}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
