import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'; // Removed Youtube

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-gray-400 hover:text-white transition-colors duration-200 text-sm">
    {children}
  </Link>
);

const SocialLink = ({ href, icon: Icon }: { href: string; icon: React.ElementType }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors duration-200">
    <Icon className="h-5 w-5" />
  </a>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navSections = [
    {
      title: "CarePop",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/download-app", label: "Download App" },
        { href: "/contact", label: "Contact Us" }, // Assuming a contact page might exist or be added
        { href: "/careers", label: "Careers" }, // Placeholder
      ],
    },
    {
      title: "Services",
      links: [
        { href: "/book-service", label: "Book a Service" },
        { href: "/clinic-finder", label: "Find a Clinic" },
        { href: "/appointments", label: "My Appointments" },
        { href: "/professionals", label: "For Professionals" }, // Placeholder for professional portal
      ],
    },
    {
      title: "FPOP (Our Partner)", // New FPOP Section
      links: [
        { href: "/about", label: "Partnership Details" }, // Links to our About Us page
        { href: "https://fpop1969.org", label: "FPOP Official Website", isExternal: true },
      ],
    },
  ];

  const socialLinks = [
    { href: "https://facebook.com/carepop", icon: Facebook, label: "Facebook" },
    { href: "https://twitter.com/carepop", icon: Twitter, label: "Twitter" },
    { href: "https://instagram.com/carepop", icon: Instagram, label: "Instagram" },
    { href: "https://linkedin.com/company/carepop", icon: Linkedin, label: "LinkedIn" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 dark:bg-gray-950">
      <div className="container mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Logo and Intro - Spans more on larger screens if needed */}
          <div className="md:col-span-2 lg:col-span-3 mb-6 lg:mb-0">
            <Link href="/" className="flex items-center mb-4">
              <Image 
                src="/carepop-logo-white.png"
                alt="CarePoP Logo"
                width={36}
                height={36}
                className="h-9 w-9 mr-2"
              />
              <span className="text-2xl font-bold text-white font-space-grotesk">
                carepop
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Accessible and inclusive healthcare for everyone. Find providers, schedule appointments, and manage your health with ease.
            </p>
          </div>

          {/* Navigation Links Sections */}
          {navSections.map((section) => (
            <div key={section.title} className="lg:col-span-2">
              <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.isExternal ? (
                      <a 
                        href={link.href}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Social Media and Legal Column (Can be combined or separate) */}
          <div className="lg:col-span-3 md:col-span-2">
             <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-4">
                Connect With Us
              </h3>
            <div className="flex space-x-5 mb-6">
              {socialLinks.map((social) => (
                <SocialLink key={social.label} href={social.href} icon={social.icon} />
              ))}
            </div>

            <h3 className="text-sm font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500 mt-6 mb-4">
                Legal
            </h3>
            <ul className="space-y-3">
                <li><FooterLink href="/privacy-policy">Privacy Policy</FooterLink></li>
                <li><FooterLink href="/terms-of-service">Terms of Service</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 dark:border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500 dark:text-gray-600">
            &copy; {currentYear} CarePop. All rights reserved.
          </p>
          {/* Optional: Additional links or info in the bottom bar */}
        </div>
      </div>
    </footer>
  );
} 