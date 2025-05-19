import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartPulse, Stethoscope, Activity, Users } from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-4 md:py-10 lg:py-12 xl:py-16 bg-card border border-border rounded-lg">
        <div className="container mx-auto px-4 md:px-6">
          {/* Hero Text Content */}
          <div className="grid gap-6 lg:grid-cols-1">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-space-grotesk text-primary">
                  Personalized Medical Services for Better Health
                </h1>
                <p className="max-w-[600px] text-secondary md:text-xl font-inter">
                  Accessible and inclusive healthcare. Find providers, schedule appointments, and manage your health with ease.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/appointments" passHref>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Schedule an Appointment
                  </Button>
                </Link>
                {/* <Link href="/services" passHref>
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link> */}
              </div>
            </div>
          </div>

          {/* Four Cards Section (Now inside Hero) */}
          <div className="mt-8 md:mt-12 lg:mt-16"> {/* Container for cards with top margin */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-background shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
                <div className="h-32 bg-border flex items-center justify-center rounded-t-lg">
                  <p className="text-sm text-muted-foreground">Image</p>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">
                    Expert Care
                  </CardTitle>
                  <HeartPulse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Access top-tier medical professionals and services.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
                <div className="h-32 bg-border flex items-center justify-center rounded-t-lg">
                  <p className="text-sm text-muted-foreground">Image</p>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">
                    Full Diagnostics
                  </CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive health check-ups and detailed reports.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
                <div className="h-32 bg-border flex items-center justify-center rounded-t-lg">
                  <p className="text-sm text-muted-foreground">Image</p>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">
                    Wellness Tracking
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Monitor your health and progress with our tools.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-background shadow-lg transition-transform duration-200 ease-in-out hover:scale-105">
                <div className="h-32 bg-border flex items-center justify-center rounded-t-lg">
                  <p className="text-sm text-muted-foreground">Image</p>
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4">
                  <CardTitle className="text-sm font-medium">
                    Community Support
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Connect with others and share your journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* TODO: Add other sections from the inspiration image below */}
      {/* For example: Partners/Community Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk mb-4">
            Join Our Community
          </h2>
          <p className="text-muted-foreground md:text-lg font-inter mb-8">
            Trusted by thousands for accessible and inclusive healthcare.
          </p>
          {/* Placeholder for logos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center">
            <div className="bg-muted h-20 flex items-center justify-center rounded-lg text-muted-foreground font-inter">Logo 1</div>
            <div className="bg-muted h-20 flex items-center justify-center rounded-lg text-muted-foreground font-inter">Logo 2</div>
            <div className="bg-muted h-20 flex items-center justify-center rounded-lg text-muted-foreground font-inter">Logo 3</div>
            <div className="bg-muted h-20 flex items-center justify-center rounded-lg text-muted-foreground font-inter">Logo 4</div>
            <div className="bg-muted h-20 flex items-center justify-center rounded-lg text-muted-foreground font-inter">Logo 5</div>
          </div>
        </div>
      </section>

      {/* TODO: "What medical service we offer" Section */}
      {/* TODO: "Optimize Your Workflow..." Section */}
      {/* TODO: "Let's meet with expert doctors" Section */}
      {/* TODO: Call to Action Section */}
      {/* TODO: Stats/Metrics Section */}
      {/* TODO: Testimonial Section */}

    </>
  );
}
