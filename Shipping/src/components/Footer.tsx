import { Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  const columns = [
    {
      title: 'Shipping',
      links: ['Ship a Package', 'Freight Shipping', 'International Shipping', 'Packaging Services', 'Ship Manager'],
    },
    {
      title: 'Tracking',
      links: ['Track Packages', 'FedEx Delivery Manager', 'Informed Delivery', 'Signature Proof', 'Advanced Tracking'],
    },
    {
      title: 'Services',
      links: ['FedEx Express', 'FedEx Ground', 'FedEx Freight', 'FedEx Office', 'Supply Chain'],
    },
    {
      title: 'Support',
      links: ['Customer Support', 'FAQs', 'File a Claim', 'Find Locations', 'Contact Us'],
    },
    {
      title: 'Company',
      links: ['About FedEx', 'Careers', 'Newsroom', 'Investor Relations', 'Sustainability'],
    },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wide">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-black text-white tracking-tighter">Fed</span>
            <span className="text-2xl font-black text-[#FF6200] tracking-tighter">Ex</span>
          </div>

          <div className="flex items-center gap-4">
            {[Facebook, Twitter, Linkedin, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-[#FF6200] transition-colors"
              >
                <Icon size={14} className="text-gray-300" />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Notice</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-600">
          &copy; {new Date().getFullYear()} FedEx. All rights reserved. This is a demonstration clone for educational purposes.
        </div>
      </div>
    </footer>
  );
}
