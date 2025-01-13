import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarDays, Users, BarChart3, MapPin, Mountain, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Regional Impact",
    description: "Make a lasting difference in the Roanoke Region through community engagement and leadership.",
    icon: <MapPin className="h-6 w-6 text-white" />,
  },
  {
    title: "Outdoor Adventure",
    description: "Promote our region's world-class outdoor recreation and natural beauty.",
    icon: <Mountain className="h-6 w-6 text-white" />,
  },
  {
    title: "Community Leadership",
    description: "Guide and shape the future of our region through active participation and collaboration.",
    icon: <Compass className="h-6 w-6 text-white" />,
  },
];

const stats = [
  { value: "50+", label: "Active Ambassadors" },
  { value: "100+", label: "Annual Events" },
  { value: "1,000+", label: "Community Members Engaged" },
  { value: "25+", label: "Partner Organizations" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white/90 backdrop-blur-sm fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/G2KN Logo Cutout.webp" 
              alt="G2KN" 
              className="h-8 w-auto"
            />
            <span className="text-lg font-medium text-[#1a472a]">
              Ambassador Program
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#1a472a] hover:bg-[#0d2415] text-white"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/login')}
                className="bg-[#1a472a] hover:bg-[#0d2415] text-white"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="relative h-[700px]">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1596894295161-22230b6aad7b?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Rhododendron field on top of the Blue Ridge Mountains"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
          </div>
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-4 leading-tight">
                  Empowering <span className="text-[#ffd700]">Community</span><br />
                  in the Roanoke Region
                </h2>
                <p className="mt-6 max-w-lg mx-auto text-xl text-white/90 sm:max-w-3xl font-medium">
                  Create and plan upcoming events, collaborate with fellow ambassadors, and track community impact.
                </p>
                {!user && (
                  <motion.div 
                    className="mt-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button 
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="bg-[#ffd700] text-[#1a472a] hover:bg-[#e6c200] font-bold text-lg px-8 py-6"
                    >
                      Join Our Community
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-[#1a472a]/10 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.h3 
                className="text-4xl font-bold text-[#1a472a]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Empowering Our Community
              </motion.h3>
              <p className="mt-4 text-lg text-gray-600">
                Join fellow ambassadors in shaping the future of the Roanoke Region
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#1a472a] to-[#00274c] opacity-25 group-hover:opacity-50 transition duration-200" />
                  <div className="relative p-6 bg-white rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-[#1a472a] flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Access Cards */}
          <section className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: <CalendarDays className="h-6 w-6 text-[#1a472a]" />,
                title: "Events Dashboard",
                description: "View and manage upcoming events, track attendance, and measure impact.",
                path: '/dashboard/events'
              },
              {
                icon: <Users className="h-6 w-6 text-[#1a472a]" />,
                title: "Program Calendar",
                description: "Access the full calendar of ambassador events and activities.",
                path: '/dashboard/calendar'
              },
              {
                icon: <BarChart3 className="h-6 w-6 text-[#1a472a]" />,
                title: "Impact Reports",
                description: "Track the collective impact of our ambassador program initiatives.",
                path: '/dashboard/reports'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-[#1a472a]/10">
                  <div className="flex items-center space-x-3 mb-3">
                    {item.icon}
                    <h3 className="text-xl font-bold text-[#1a472a]">{item.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {item.description}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate(item.path)}
                    className="w-full border-[#1a472a] text-[#1a472a] hover:bg-[#1a472a] hover:text-white"
                  >
                    View {item.title.split(' ')[0]}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </section>

          {/* Stats Section */}
          <section className="relative py-16">
            <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-[#1a472a]/10 via-[#ffd700]/10 to-white" />
            <div className="relative rounded-lg p-8 mb-12">
              <motion.h3 
                className="text-3xl font-bold text-center mb-12 text-[#1a472a]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Our Growing Impact
              </motion.h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="p-6 bg-white rounded-lg shadow-sm border-2 border-[#1a472a]/10 hover:border-[#1a472a]/30 transition-all duration-300"
                  >
                    <div className="text-4xl font-extrabold text-[#1a472a] mb-2">{stat.value}</div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#1a472a]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold text-[#1a472a] mb-4">Contact</h4>
              <p className="text-sm text-gray-600">
                Roanoke Regional Partnership<br />
                111 Franklin Plaza, Suite 333<br />
                Roanoke, VA 24011
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[#1a472a] mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="https://get2knownoke.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a472a] transition-colors">
                    Get2KnowNoke
                  </a>
                </li>
                <li>
                  <a href="/dashboard/events" className="hover:text-[#1a472a] transition-colors">Events Calendar</a>
                </li>
                <li>
                  <a href="/dashboard/reports" className="hover:text-[#1a472a] transition-colors">Impact Reports</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[#1a472a] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="https://get2knownoke.com/privacy-policy/" className="hover:text-[#1a472a] transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="https://get2knownoke.com/privacy-policy/" className="hover:text-[#1a472a] transition-colors">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Roanoke Regional Partnership. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 