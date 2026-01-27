import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { href: '/about', label: 'About' },
    { href: '/mission', label: 'Mission & Vision' },
    { href: '/volunteer', label: 'Volunteer' },
    { href: '/transparency', label: 'Transparency' },
  ]

  const getInvolvedLinks = [
    { href: '/community', label: 'Join Community' },
    { href: '/books', label: 'Donate Books' },
    { href: '/events', label: 'Events' },
    { href: '/donations', label: 'Donate' },
  ]

  return (
    <footer className="relative bg-gray-900 dark:bg-gray-950 text-white mt-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float-slow"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="stagger-item">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
              APC
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Building a stronger community through education, events, and meaningful collaboration worldwide.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="p-2 bg-primary-600 rounded-lg hover-lift hover:bg-primary-500 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-600 rounded-lg hover-lift hover:bg-primary-500 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-primary-600 rounded-lg hover-lift hover:bg-primary-500 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="stagger-item delay-100">
            <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={link.href} style={{ animationDelay: `${index * 50}ms` }}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors group inline-flex items-center"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div className="stagger-item delay-200">
            <h4 className="text-lg font-semibold mb-6">Get Involved</h4>
            <ul className="space-y-3">
              {getInvolvedLinks.map((link, index) => (
                <li key={link.href} style={{ animationDelay: `${index * 50}ms` }}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors group inline-flex items-center"
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="stagger-item delay-300">
            <h4 className="text-lg font-semibold mb-6">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400 hover:text-white transition-colors group">
                <Mail className="w-5 h-5 mt-1 flex-shrink-0 group-hover:animate-float" />
                <span>contact@apc.org</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 hover:text-white transition-colors group">
                <Phone className="w-5 h-5 mt-1 flex-shrink-0 group-hover:animate-float" />
                <span>+91 1234567890</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-400 hover:text-white transition-colors group">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0 group-hover:animate-float" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800"></div>

        {/* Bottom Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 animate-fade-in-up">
            © {currentYear} <span className="font-semibold text-white">APC</span>. Empowering communities worldwide.
          </p>
          <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
