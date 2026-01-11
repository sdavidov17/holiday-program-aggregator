import { ChevronRight, Clock, Heart, MapPin, Search, Shield, Star, Users } from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ActivityIcon from '~/components/ui/ActivityIcon';
import Logo from '~/components/ui/Logo';
import ProviderCard from '~/components/ui/ProviderCard';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/search?q=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}`,
    );
  };

  // Sample provider data for showcase
  const featuredProviders = [
    {
      id: '1',
      name: 'Creative Kids Club',
      description: 'Fun and engaging arts & crafts activities for children aged 5-12',
      rating: 4.8,
      reviewCount: 123,
      location: 'Sydney',
      isVetted: true,
      tags: ['Arts & Crafts', 'Indoor', '5-12 years'],
    },
    {
      id: '2',
      name: 'Sports Academy',
      description: 'Professional sports coaching in multiple disciplines',
      rating: 4.9,
      reviewCount: 89,
      location: 'Melbourne',
      isVetted: true,
      tags: ['Sports', 'Outdoor', 'All ages'],
    },
    {
      id: '3',
      name: 'Tech Wizards',
      description: 'Coding and robotics workshops for future innovators',
      rating: 4.7,
      reviewCount: 67,
      location: 'Brisbane',
      isVetted: true,
      tags: ['Technology', 'STEM', '8-16 years'],
    },
  ];

  return (
    <>
      <Head>
        <title>Parent Pilot - Find School Holiday Programs for Kids</title>
        <meta
          name="description"
          content="Discover amazing school holiday activities and programs for your children. Trusted by thousands of Australian families."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/search"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Browse Activities
              </Link>
              <Link
                href="/providers"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Providers
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  {session.user.role === 'ADMIN' && (
                    <Link href="/admin" className="btn-ghost">
                      Admin
                    </Link>
                  )}
                  <Link href="/profile" className="btn-secondary">
                    My Account
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="btn-ghost">
                    Sign In
                  </Link>
                  <Link href="/auth/signin?signup=true" className="btn-primary">
                    <span data-testid="hero-cta">Get Started</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              <Users className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100" data-testid="mobile-menu">
              <nav className="flex flex-col gap-4 mt-4">
                <Link
                  href="/search"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                  data-testid="mobile-search"
                >
                  Browse Activities
                </Link>
                <Link
                  href="/providers"
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  Providers
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-primary-600 font-medium">
                  About
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section relative overflow-hidden">
        <div className="container-custom section-padding">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-in">
              <h1 className="text-3xl lg:text-4xl font-sans font-semibold text-gray-900 mb-4">
                Find providers for school holidays
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Search through thousands of verified holiday programs and activities for your
                children
              </p>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="bg-white rounded-lg border border-gray-300 p-2">
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search activities..."
                      className="w-full pl-12 pr-4 py-4 focus:outline-none text-gray-900"
                      data-testid="search-input"
                      aria-label="Search activities"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Location or postcode"
                      className="w-full pl-12 pr-4 py-4 focus:outline-none text-gray-900"
                      data-testid="search-location"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary px-8"
                    data-testid="search-button"
                    aria-label="Search"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-700" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">500+</strong> Vetted Providers
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-700" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">10,000+</strong> Happy Families
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-700 fill-gray-700" />
                  <span className="text-sm text-gray-600">
                    <strong className="text-gray-900">4.8</strong> Average Rating
                  </span>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative hidden lg:block">
              <div className="relative bg-white rounded-lg border border-gray-200 p-8">
                <div className="grid grid-cols-2 gap-4">
                  <ActivityIcon type="arts" size="lg" />
                  <ActivityIcon type="sports" size="lg" />
                  <ActivityIcon type="science" size="lg" />
                  <ActivityIcon type="music" size="lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Activities */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-sans font-semibold text-gray-900 mb-2">
              Popular Activities
            </h2>
            <p className="text-base text-gray-600">Explore activities by category</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <ActivityIcon type="arts" />
            <ActivityIcon type="sports" />
            <ActivityIcon type="dance" />
            <ActivityIcon type="science" />
            <ActivityIcon type="music" />
            <ActivityIcon type="outdoor" />
            <ActivityIcon type="cooking" />
            <ActivityIcon type="tech" />
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-sans font-semibold text-gray-900 mb-2">
                Featured Providers
              </h2>
              <p className="text-base text-gray-600">Discover top-rated holiday program providers</p>
            </div>
            <Link href="/providers" className="btn-secondary hidden md:flex items-center gap-2">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} {...provider} />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/providers" className="btn-secondary inline-flex items-center gap-2">
              View All Providers <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-sans font-semibold text-gray-900 mb-2">
              Why Families Choose Parent Pilot
            </h2>
            <p className="text-base text-gray-600">
              Everything you need to find the perfect holiday program
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-7 h-7 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Vetted Providers</h3>
              <p className="text-sm text-gray-600">
                All providers are carefully reviewed and verified for safety and quality
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Star className="w-7 h-7 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real Reviews</h3>
              <p className="text-sm text-gray-600">
                Honest feedback from real parents to help you make informed decisions
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-7 h-7 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Save Time</h3>
              <p className="text-sm text-gray-600">
                Find and compare programs quickly with our smart search and filters
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Peace of Mind</h3>
              <p className="text-sm text-gray-600">
                Book with confidence knowing your children are in good hands
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gray-900 border-t border-gray-800">
        <div className="container-custom text-center">
          <h2 className="text-2xl font-sans font-semibold text-white mb-3">
            Ready to Find the Perfect Holiday Program?
          </h2>
          <p className="text-base text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of Australian families who trust Parent Pilot to find amazing school
            holiday activities
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {session ? (
              <Link
                href="/search"
                className="btn bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 text-base"
              >
                Start Searching
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/signin?signup=true"
                  className="btn bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 text-base"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/auth/signin"
                  className="btn bg-gray-800 text-white hover:bg-gray-700 border border-gray-700 px-6 py-3 text-base"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Logo showText={false} />
                <span className="font-sans font-bold text-xl text-white ml-2">Parent Pilot</span>
              </div>
              <p className="text-sm">
                Australia&apos;s trusted platform for finding school holiday programs
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Browse</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/search" className="text-sm hover:text-white transition-colors">
                    Search Programs
                  </Link>
                </li>
                <li>
                  <Link href="/providers" className="text-sm hover:text-white transition-colors">
                    All Providers
                  </Link>
                </li>
                <li>
                  <Link href="/activities" className="text-sm hover:text-white transition-colors">
                    Activities
                  </Link>
                </li>
                <li>
                  <Link href="/locations" className="text-sm hover:text-white transition-colors">
                    Locations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-sm hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">For Providers</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/providers/join"
                    className="text-sm hover:text-white transition-colors"
                  >
                    List Your Program
                  </Link>
                </li>
                <li>
                  <Link
                    href="/providers/resources"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    href="/providers/support"
                    className="text-sm hover:text-white transition-colors"
                  >
                    Provider Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; 2026 Parent Pilot. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
