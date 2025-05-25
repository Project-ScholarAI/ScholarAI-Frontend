import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BookOpen,
  Brain,
  Search,
  FileText,
  BarChart3,
  MessageSquare,
  CheckCircle,
  Zap,
  Users,
  Globe,
  ArrowRight,
  Sparkles,
  Target,
  Clock,
  Shield
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">ScholarAI</span>
            </div>
            <Link href="/login">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              AI-Powered Research Assistant
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Accelerate Your
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {" "}Research Journey
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Transform how you discover, analyze, and synthesize academic papers with our intelligent AI agents.
              From automated paper retrieval to gap analysis and contextual Q&A.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Start Researching
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <BookOpen className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Intelligent Research Workflow
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI agents work together to streamline every aspect of your research process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Automated Paper Retrieval */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="h-6 w-6 text-primary" />
                  <CardTitle>Automated Paper Retrieval</CardTitle>
                </div>
                <CardDescription>
                  WebSearch Agent finds and downloads relevant papers from multiple academic databases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Multi-source academic search
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Automatic PDF downloads
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Duplicate detection
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Extraction */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle>Smart Summarization</CardTitle>
                </div>
                <CardDescription>
                  Scraper & Summarizer Agents extract key insights and generate structured summaries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Multi-level summaries
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Structured fact extraction
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Key metrics tables
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Paper Scoring */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <CardTitle>Intelligent Scoring</CardTitle>
                </div>
                <CardDescription>
                  Critic Agent evaluates papers based on impact, relevance, and quality metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Citation-based ranking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Venue prestige analysis
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Relevance scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gap Analysis */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-primary" />
                  <CardTitle>Research Gap Analysis</CardTitle>
                </div>
                <CardDescription>
                  Gap Analysis Agent identifies research opportunities and suggests novel topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Automated gap detection
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Topic suggestions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Opportunity scoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contextual QA */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  <CardTitle>Contextual Q&A</CardTitle>
                </div>
                <CardDescription>
                  QA Agent provides instant answers based on your selected documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Document-grounded answers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Multi-paper context
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Citation tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Project Management */}
            <Card className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <CardTitle>Project Management</CardTitle>
                </div>
                <CardDescription>
                  Organize research with task checklists, reminders, and progress tracking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Reading progress tracking
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Calendar integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Smart reminders
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How ScholarAI Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              A seamless workflow powered by specialized AI agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Project</h3>
              <p className="text-muted-foreground text-sm">
                Set up your research domain and topics to scope your investigation
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Fetch Papers</h3>
              <p className="text-muted-foreground text-sm">
                AI agents automatically find and download relevant academic papers
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Analyze & Score</h3>
              <p className="text-muted-foreground text-sm">
                Extract insights, generate summaries, and score papers by relevance
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Gaps</h3>
              <p className="text-muted-foreground text-sm">
                Identify research opportunities and get suggestions for novel topics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
                Why Choose ScholarAI?
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Zap className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">10x Faster Research</h3>
                    <p className="text-muted-foreground">
                      Automate paper discovery, reading, and analysis to focus on insights
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Comprehensive Coverage</h3>
                    <p className="text-muted-foreground">
                      Access papers from multiple academic databases and sources
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Collaborative Workflow</h3>
                    <p className="text-muted-foreground">
                      Share projects, insights, and findings with your research team
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Globe className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground">Always Up-to-Date</h3>
                    <p className="text-muted-foreground">
                      Stay current with the latest research in your field automatically
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <span className="text-sm font-medium">Papers Retrieved</span>
                    <Badge variant="secondary">1,247</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <span className="text-sm font-medium">Time Saved</span>
                    <Badge variant="secondary">156 hours</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <span className="text-sm font-medium">Research Gaps Found</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
                    <span className="text-sm font-medium">Novel Topics Suggested</span>
                    <Badge variant="secondary">47</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl mb-6">
              Ready to Transform Your Research?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join researchers worldwide who are accelerating their discoveries with ScholarAI
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold text-primary">ScholarAI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ScholarAI. Accelerating research with AI.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
