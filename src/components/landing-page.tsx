'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image' 
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignInButton, SignUpButton, useAuth, useClerk } from "@clerk/nextjs"
import { toast } from "sonner"

export function LandingPageComponent() {
  const { isSignedIn } = useAuth()
  const { signOut } = useClerk()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error("Failed to sign out")
    }
  }

  const HeroImage = () => (
    <div className="w-full h-[333px] relative rounded-lg shadow-xl overflow-hidden">
      <Image
        src="/images/aging-parents2.png"
        alt="Caring for Aging Parents"
        layout="fixed"
        objectFit="contain"
        width={900}
        height={1000}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-[#00856A]">Poppa.AI Med Tracking</span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-[#00856A] inline-flex items-center px-1 pt-1 text-sm font-medium">
                Features
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-[#00856A] inline-flex items-center px-1 pt-1 text-sm font-medium">
                How It Works
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-[#00856A] inline-flex items-center px-1 pt-1 text-sm font-medium">
                Testimonials
              </Link>
              <Link href="#faq" className="text-gray-700 hover:text-[#00856A] inline-flex items-center px-1 pt-1 text-sm font-medium">
                FAQ
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              {isSignedIn ? (
                <>
                  <button 
                    onClick={handleSignOut}
                    className="text-[#00856A] hover:text-[#006B55] font-bold py-2 px-4 rounded-full transition duration-300">
                    Sign Out
                  </button>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="text-[#00856A] hover:text-[#006B55] font-bold py-2 px-4 rounded-full transition duration-300">
                    Dashboard
                  </button>
                  <button 
                    onClick={() => router.push('/onboarding')}
                    className="bg-[#00856A] hover:bg-[#006B55] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                    Try it now!
                  </button>
                </>
              ) : (
                <>
                  <SignInButton mode="modal">
                    <button className="text-[#00856A] hover:text-[#006B55] font-bold py-2 px-4 rounded-full transition duration-300">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="bg-[#00856A] hover:bg-[#006B55] text-white font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
                      Sign Up
                    </button>
                  </SignUpButton>
                </>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#00856A]"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-[#F4F9F8]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="lg:w-1/2">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block text-[#00856A]">Caring for Your</span>
                  <span className="block">Aging Parents</span>
                </h1>
                <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                  Poppa.AI Med Tracking: Your partner in providing the best care for your loved ones.
                </p>
                <div className="mt-10 sm:flex">
                  <div className="rounded-full shadow">
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-[#00856A] hover:bg-[#006B55] md:py-4 md:text-lg md:px-10">
                      Get Started
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-[#00856A] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                      Learn More
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 lg:w-1/2">
                <div className="w-full max-w-[500px] mx-auto">
                  <HeroImage />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
        >
          <div className="text-center">
            <h2 className="text-base text-[#00856A] font-semibold tracking-wide uppercase">Poppa.AI Med Tracking</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Revolutionizing Health Management            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Take control of your loved one&apos;s health with Poppa.AI Med Tracking—an AI-driven solution designed to make medical tracking stress-free and efficient.
            </p>
          </div>

          <div className="mt-20">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  title: 'Real-Time Health Insights',
                  description: 'Stay informed with instant updates on vital health metrics, ensuring you\'re always in the loop about your loved one\'s well-being. Our AI-powered platform keeps track of activity levels and medication adherence, giving you peace of mind at all times.'
                },
                {
                  title: 'Seamless Medication Management',
                  description: 'Never miss a dose again. Poppa.AI Med Tracking\'s advanced medication reminders help your loved ones maintain their health regimen while keeping you informed. Receive timely notifications for every dose, making health management simple and effective.'
                },
                {
                  title: 'Instant Health Alerts',
                  description: 'Stay prepared for any situation. Get immediate alerts whenever important medication schedules are missed. Our system ensures you\'re aware and can take action promptly.'
                },
                {
                  title: 'Caring & Coordination Made Easy',
                  description: 'Bring the family together in caregiving. Poppa.AI Med Tracking simplifies communication between family members and/or caregivers, so everyone is on the same page. Assign tasks, track progress, and manage updates seamlessly from the app.'
                }
              ].map((feature) => (
                <div key={feature.title} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#00856A] text-white">
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    {feature.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          id="how-it-works"
          className="bg-[#F4F9F8] py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-base text-[#00856A] font-semibold tracking-wide uppercase">Where Do I Start</h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Begin with Simple Med Tracking
              </p>
            </div>

            <div className="mt-20">
              <div className="flex flex-col md:flex-row justify-center items-center space-y-10 md:space-y-0 md:space-x-10">
                {['Select Your Meds', 'Set Up Profile', 'Sign Up', 'Set Alerts & Notifications'].map((step, index) => (
                  <div key={step} className="flex flex-col items-center">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-[#00856A] text-white text-2xl font-bold">
                      {index + 1}
                    </div>
                    <h3 className="mt-6 text-xl font-medium text-gray-900">{step}</h3>
                    <p className="mt-2 text-base text-gray-500 text-center max-w-xs">
                      {index === 0 && "Quickly search from the FDA meds list and select the right medications, dosage, and schedule for your loved one."}
                      {index === 1 && "With simple elements, let us know about your loved one's inner circle and basic health information. This helps personalize the experience."}
                      {index === 2 && "With just a few clicks and some basic info, you can get onboard and start using Poppa.AI Med Tracking to simplify health management."}
                      {index === 3 && "Receive real-time updates and alerts to stay informed of your loved one's health status at all times."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          id="testimonials"
          className="py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-16">
              What our customers are saying
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Sarah L.", quote: "Poppa.AI Med Tracking has given me peace of mind knowing that I can monitor my mother's health from afar. It truly makes a difference." },
                { name: "Michael R.", quote: "The medication reminders have been a game-changer for my father's health management. I no longer worry about missed doses." },
                { name: "Emily T.", quote: "The caregiver coordination feature has made it so much easier to communicate with my siblings about our parents' care. We're all more involved now." },
                { name: "Alex P.", quote: "Having an updated list of my father's meds saved us during an ER visit. The doctors avoided a dangerous interaction thanks to Poppa.AI Med Tracking." }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white shadow-lg rounded-lg p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Image
                        src="/images/testimonial1.jpg"
                        alt="Testimonial 1"
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="h-5 w-5 text-[#00856A]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">
                    &quot;Take control of your loved one&apos;s health with Poppa.AI Med Tracking&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          id="faq"
          className="bg-[#F4F9F8] py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-16">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              {[
                { q: "How does Poppa.AI Med Tracking work?", a: "Poppa.AI Med Tracking leverages wearable devices, a smartphone app, and our AI-driven platform to monitor health metrics. It provides real-time updates, medication reminders, and health alerts, ensuring you have everything you need to manage your loved one's care effectively." },
                { q: "Is my health data secure?", a: "Yes, we prioritize data security. All health information is encrypted and stored securely in compliance with HIPAA regulations. Your data is never shared without your explicit consent." },
                { q: "Can multiple family members access the same account?", a: "Absolutely. Our caregiver coordination feature allows multiple family members to participate in your loved one's care. You can assign different permission levels, ensuring that everyone stays informed while maintaining control over privacy." },
                { q: "What types of health metrics does Poppa.AI Med Tracking monitor?", a: "Our platform tracks a wide range of metrics, including activity levels, sleep patterns, and medication adherence. Metrics are customizable to suit your loved one's specific health needs." }
              ].map((faq, index) => (
                <div key={index} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {faq.q}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-[#00856A] text-white py-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Ready to get started?</h2>
            <p className="text-xl mb-8">Join thousands of families providing better care to their loved ones with Poppa.AI Med Tracking. Take the first step towards stress-free health management today.!</p>
            <button className="bg-white text-[#00856A] font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100">
              Sign Up Now
            </button>
          </div>
        </motion.section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-[#00856A]">Poppa.AI Med Tracking</h3>
              <p className="mt-2 text-sm">Revolutionizing medical tracking with AI</p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="hover:text-[#00856A]">Home</Link></li>
                <li><Link href="#features" className="hover:text-[#00856A]">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-[#00856A]">How It Works</Link></li>
                <li><Link href="#testimonials" className="hover:text-[#00856A]">Testimonials</Link></li>
                <li><Link href="#faq" className="hover:text-[#00856A]">FAQ</Link></li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-[#00856A]">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#00856A]">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="hover:text-[#00856A]">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} Poppa.AI Med Tracking. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
