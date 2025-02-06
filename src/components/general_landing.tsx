import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Brain,
  CheckCircle,
  Users,
  Lightbulb,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react"
import { ReactElement } from "react"

interface FeatureCardProps {
  icon: ReactElement
  title: string
  description: string
}

interface SocialIconProps {
  href: string
  icon: ReactElement
  label: string
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-green-50 shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/poppa-ai-logo.svg" alt="Poppa.AI Logo" width={50} height={50} />
            <span className="text-2xl font-bold text-primary">Poppa.AI</span>
          </div>
          <nav>
            <ul className="flex space-x-6 text-lg">
              <li>
                <a href="#features" className="text-gray-600 hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-primary">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-600 hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-green-100 to-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold text-primary mb-6">Poppa Virtual Concierge</h1>
            <p className="text-xl text-gray-600 mb-8">Connecting Generations, Simplifying Life.</p>
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started
            </Button>
          </div>
        </section>

        <section className="py-20 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-8">Our Mission</h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              Poppa Care is a virtual concierge service designed to support independent seniors and bring peace of mind
              to their families. We help with everyday tasks, appointments, and reminders, fostering stronger
              connections and a more enjoyable lifestyle for everyone.
            </p>
          </div>
        </section>

        <section id="features" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FeatureCard
                icon={<Users className="w-12 h-12 text-green-600" />}
                title="Daily Essentials "
                description="Stay connected with your loved ones through shared schedules and updates. Poppa.AI makes it easy to coordinate family activities and foster collaboration."
              />
              <FeatureCard
                icon={<Brain className="w-12 h-12 text-green-600" />}
                title="Engaging Cognitive Challenges"
                description="Keep your mind sharp and active with entertaining games and challenges designed to promote cognitive engagement and create moments of fun."
              />
              <FeatureCard
                icon={<CheckCircle className="w-12 h-12 text-green-600" />}
                title="Effortless Daily Coordination"
                description="Simplify your day-to-day life with intuitive tools for organizing tasks, setting reminders, and managing responsibilities with ease."
              />
              <FeatureCard
                icon={<Lightbulb className="w-12 h-12 text-green-600" />}
                title="Discover Lifestyle Inspiration"
                description="Explore senior-friendly activities, events, and hobbies that enhance your quality of life. Find tailored suggestions for meaningful experiences."
              />
            </div>
          </div>
        </section>

        <section className="bg-green-100 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Enhance Your Golden Years?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Join Poppa.AI today and experience a more connected, engaged, and organized lifestyle.
            </p>
            <Button size="lg" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-green-50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <Image src="/poppa-ai-logo.svg" alt="Poppa.AI Logo" width={50} height={50} className="inline-block" />
              <span className="text-2xl font-bold text-primary ml-2">Poppa.AI</span>
            </div>
            <div className="text-center grid grid-cols-2 gap-4">
              <Link href="#features" className="text-gray-600 hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-primary transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-primary transition-colors">
                Contact
              </Link>
              <Link href="/privacy-policy" className="text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-use" className="text-gray-600 hover:text-primary transition-colors">
                Terms of Use
              </Link>
            </div>
            <div className="text-center md:text-right">
              <h3 className="text-lg font-semibold mb-4">Connect with us</h3>
              <div className="flex justify-center md:justify-end space-x-4">
                <SocialIcon href="https://facebook.com" icon={<Facebook />} label="Facebook" />
                <SocialIcon href="https://twitter.com" icon={<Twitter />} label="Twitter" />
                <SocialIcon href="https://instagram.com" icon={<Instagram />} label="Instagram" />
                <SocialIcon href="https://linkedin.com" icon={<Linkedin />} label="LinkedIn" />
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600">
            <p>&copy; 2023 Poppa.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="text-center border-green-200 hover:border-green-300 transition-colors duration-300">
      <CardHeader>
        <div className="mx-auto mb-4 text-green-600">{icon}</div>
        <CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function SocialIcon({ href, icon, label }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 hover:text-primary transition-colors"
      aria-label={label}
    >
      {icon}
    </a>
  )
}

