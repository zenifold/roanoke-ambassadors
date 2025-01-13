import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarDays, Users, BarChart3, MapPin, Mountain, Compass } from 'lucide-react';

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
            <span className="text-lg font-medium text-gray-900">
              Ambassador Program
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <Button onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <div className="relative h-[600px]">
          <div className="absolute inset-0">
            <img
              className="h-full w-full object-cover"
              src="https://images.unsplash.com/photo-1578168593902-ebc6b4c3efd4?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
              alt="McAfee Knob on the Appalachian Trail"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
          </div>
          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-4">
                Ambassador Program Portal
              </h2>
              <p className="mt-6 max-w-lg mx-auto text-xl text-white/90 sm:max-w-3xl">
                Access upcoming events, track community impact, and collaborate with fellow ambassadors.
              </p>
              {!user && (
                <div className="mt-10">
                  <Button 
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="bg-white text-black hover:bg-gray-100"
                  >
                    Sign In to Access Portal
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold text-gray-900">
                Empowering Our Community
              </h3>
              <p className="mt-4 text-lg text-gray-600">
                Join fellow ambassadors in shaping the future of the Roanoke Region
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="relative group">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 opacity-25 group-hover:opacity-50 transition duration-200" />
                  <div className="relative p-6 bg-white rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quick Access Cards */}
          <section className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <CalendarDays className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Events Dashboard</h3>
              </div>
              <p className="text-gray-600 mb-4">
                View and manage upcoming events, track attendance, and measure impact.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/events')}
                className="w-full"
              >
                View Events
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Program Calendar</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Access the full calendar of ambassador events and activities.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/calendar')}
                className="w-full"
              >
                View Calendar
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-semibold">Impact Reports</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Track the collective impact of our ambassador program initiatives.
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/reports')}
                className="w-full"
              >
                View Reports
              </Button>
            </Card>
          </section>

          {/* Stats Section */}
          <section className="relative">
            <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-blue-100 via-blue-50 to-white" />
            <div className="relative rounded-lg p-8 mb-12">
              <h3 className="text-2xl font-semibold text-center mb-8">Program Impact</h3>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                {stats.map((stat, index) => (
                  <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                    <div className="text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-gray-600">
                Roanoke Regional Partnership<br />
                111 Franklin Plaza, Suite 333<br />
                Roanoke, VA 24011
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="https://roanoke.org" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    Roanoke.org
                  </a>
                </li>
                <li>
                  <a href="/dashboard/events" className="hover:text-blue-600">Events Calendar</a>
                </li>
                <li>
                  <a href="/dashboard/reports" className="hover:text-blue-600">Impact Reports</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-blue-600">Terms of Service</a>
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