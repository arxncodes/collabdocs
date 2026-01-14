import { AppLayout } from '@/components/layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  Mail,
  Heart,
  Sparkles,
  Github,
  Globe,
  Zap,
  Shield,
  Users,
  FileText,
} from 'lucide-react';

export default function CreditsPage() {
  const technologies = [
    { name: 'React', icon: '⚛️', description: 'UI Framework' },
    { name: 'TypeScript', icon: '📘', description: 'Type Safety' },
    { name: 'Tailwind CSS', icon: '🎨', description: 'Styling' },
    { name: 'shadcn/ui', icon: '🎭', description: 'Components' },
    { name: 'Supabase', icon: '⚡', description: 'Backend' },
    { name: 'Vite', icon: '⚡', description: 'Build Tool' },
  ];

  const features = [
    { icon: FileText, label: 'Real-time Collaboration', color: 'text-blue-500' },
    { icon: Users, label: 'Multi-user Editing', color: 'text-green-500' },
    { icon: Shield, label: 'Secure Authentication', color: 'text-purple-500' },
    { icon: Zap, label: 'Fast Performance', color: 'text-yellow-500' },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Credits</h1>
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-lg">
            Meet the team behind this collaborative platform
          </p>
        </div>

        <div className="space-y-6">
          {/* Developer Card */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">arxncodes</CardTitle>
                  <CardDescription className="text-base">Lead Developer</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Full-stack developer passionate about building modern, scalable web applications
                with exceptional user experiences.
              </p>

              {/* Contact Information */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href="mailto:aryanaditya8439@gmail.com"
                      className="text-sm text-primary hover:underline"
                    >
                      aryanaditya8439@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Github className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">GitHub</p>
                    <a
                      href="https://github.com/arxncodes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      github.com/arxncodes
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <Globe className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Developer</p>
                    <p className="text-sm text-muted-foreground">arxncodes</p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => window.location.href = 'mailto:aryanaditya8439@gmail.com'}
                >
                  <Mail className="h-4 w-4" />
                  Email Me
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open('https://github.com/arxncodes', '_blank')}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* About the App */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                About This Application
              </CardTitle>
              <CardDescription>
                A modern real-time collaboration platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                CollabDocs is a powerful real-time collaboration platform that enables teams to
                work together seamlessly on documents. Built with modern web technologies, it
                provides a fast, secure, and intuitive experience for collaborative editing.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {features.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                  >
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    <span className="text-sm font-medium">{feature.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Technologies Used */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Built With
              </CardTitle>
              <CardDescription>
                Modern technologies for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                {technologies.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <span className="text-2xl">{tech.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{tech.name}</p>
                      <p className="text-xs text-muted-foreground">{tech.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Version & Copyright */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  <span className="text-sm">Made with passion and dedication</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">CollabDocs v1.0.0</p>
                  <p className="text-xs text-muted-foreground">
                    © 2026 CollabDocs. All rights reserved.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">Real-time Collaboration</Badge>
                  <Badge variant="secondary">Open Source Ready</Badge>
                  <Badge variant="secondary">Modern Stack</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Thank You Message */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <Sparkles className="h-8 w-8 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Thank You!</h3>
                <p className="text-muted-foreground">
                  Thank you for using CollabDocs. We're constantly working to improve your
                  collaboration experience. If you have any feedback or suggestions, feel free
                  to reach out!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
