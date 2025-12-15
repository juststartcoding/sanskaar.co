import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const footerSections = [
    {
      title: 'Explore',
      links: [
        { name: 'Poojas & Rituals', href: '/poojas' },
        { name: 'Temples', href: '/temples' },
        { name: 'Pandits', href: '/pandits' },
        { name: 'Shop', href: '/shop' },
      ],
    },
    {
      title: 'Services',
      links: [
        { name: 'Book Pandit', href: '/pandits' },
        { name: 'Waste Collection', href: '/waste-collection' },
        { name: 'Sanskrit Learning', href: '/courses' },
        { name: 'Family Tree', href: '/family-tree' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'About Us', href: '/about' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Refund Policy', href: '/refund' },
        { name: 'Shipping Policy', href: '/shipping' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🕉</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">Sanskaar</span>
                <span className="text-sm text-gray-400">संस्कार</span>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Your comprehensive platform for Hindu rituals, traditions, and spiritual guidance. 
              Connecting devotees with authentic poojas, pandits, and sacred knowledge.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                 className="p-2 bg-gray-800 hover:bg-orange-600 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-gray-800 hover:bg-orange-600 rounded-full transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-gray-800 hover:bg-orange-600 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="p-2 bg-gray-800 hover:bg-orange-600 rounded-full transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-orange-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Address</h4>
                <p className="text-gray-400 text-sm">
                  123 Temple Street, Mumbai, Maharashtra 400001, India
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Phone</h4>
                <p className="text-gray-400 text-sm">+91 1234567890</p>
                <p className="text-gray-400 text-sm">Toll Free: 1800-123-4567</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">Email</h4>
                <p className="text-gray-400 text-sm">support@sanskaar.co</p>
                <p className="text-gray-400 text-sm">info@sanskaar.co</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Sanskaar.co. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <img src="/payment-methods.png" alt="Payment Methods" className="h-8 opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
