import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, HeartPulse, CalendarDays, MessageSquareText } from 'lucide-react';

// Placeholder for App Store and Google Play logos
const AppStoreIcon = () => <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19.3 5.4c-.8-.8-1.9-1.3-3-1.3-1.5 0-2.8.6-3.8 1.6-.9-1-2.2-1.6-3.7-1.6-1.2 0-2.3.5-3.1 1.3C4.3 6.9 4 8.5 4 10.1c0 2.6 1.4 4.8 3.5 6.4.5.4 1 .7 1.6.9.6.2 1.2.3 1.9.3s1.3-.1 1.9-.3c.6-.2 1.1-.5 1.6-.9 2.1-1.6 3.5-3.8 3.5-6.4 0-1.6-.3-3.2-1.7-4.7zM12 14.4c-.6 0-1.1-.5-1.1-1.1s.5-1.1 1.1-1.1 1.1.5 1.1 1.1-.5 1.1-1.1 1.1z"/></svg>;
const GooglePlayIcon = () => <svg className="h-8 w-8 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M3 2v20l18-10L3 2zm6 9H3v2h6v-2z"/></svg>;

const DownloadAppPage = () => {
  return (
    <div className="bg-background text-foreground">
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            Your Health, In Your Hands
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Download the CarePop app to manage appointments, connect with providers, and take control of your sexual and reproductive health—anytime, anywhere.
          </p>
          <div className="flex justify-center items-center gap-4 mb-12">
            <Button size="lg" disabled className="flex items-center">
              <AppStoreIcon />
              <span>Coming Soon</span>
            </Button>
            <Button size="lg" disabled className="flex items-center">
              <GooglePlayIcon />
              <span>Coming Soon</span>
            </Button>
          </div>
          {/* Visual Element Placeholder */}
          <div className="relative max-w-4xl mx-auto">
             <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Smartphone className="h-24 w-24 text-muted-foreground" />
             </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Everything you need, in one app.</h2>
            <p className="mt-4 text-muted-foreground">
              Our mobile app is designed to be your trusted partner in health, providing seamless access to the care you deserve.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-background/70 border-none shadow-sm">
              <CardHeader className="flex items-center text-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <CalendarDays className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Easy Scheduling</CardTitle>
                <p className="text-sm text-muted-foreground pt-2">Book and manage your appointments with just a few taps.</p>
              </CardHeader>
            </Card>
            <Card className="bg-background/70 border-none shadow-sm">
                <CardHeader className="flex items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <MessageSquareText className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Secure Messaging</CardTitle>
                    <p className="text-sm text-muted-foreground pt-2">Communicate directly and securely with your healthcare providers.</p>
              </CardHeader>
            </Card>
            <Card className="bg-background/70 border-none shadow-sm">
                <CardHeader className="flex items-center text-center">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                        <HeartPulse className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Health Tracking</CardTitle>
                    <p className="text-sm text-muted-foreground pt-2">Keep track of your health journey, from medications to mood.</p>
                </CardHeader>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DownloadAppPage; 