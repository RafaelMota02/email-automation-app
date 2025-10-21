import { Link } from "react-router-dom";
import { ArrowRightIcon, ChartBarIcon, EnvelopeIcon, UserGroupIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-600 to-indigo-800 text-white px-4 relative min-h-screen flex items-center">

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 sm:mb-8 tracking-tight leading-tight">
                Automate Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Email Campaigns
                </span>
                Like Never Before
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-10 opacity-90 leading-relaxed">
                This platform helps you create, personalize, and send bulk email campaigns with ease.
                Save time, increase engagement, and grow your business.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 sm:gap-6">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 group text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-300 text-lg shadow-md hover:shadow-lg hover:-translate-y-1">
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                {/* Main visual element - Email mockup */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 mb-6">
                    <EnvelopeIcon className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Campaign Title</h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    Hello [First Name], check out our latest updates and offers tailored just for you!
                  </p>
                  <div className="flex items-center text-indigo-600">
                    <span className="font-semibold mr-2">View Campaign</span>
                    <ArrowRightIcon className="h-4 w-4" />
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -left-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
                  <ChartBarIcon className="h-6 w-6 text-indigo-800" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-green-400 rounded-full p-3 shadow-lg animate-pulse">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Our streamlined process makes email automation simple and effective. Get started in minutes with our intuitive platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">

            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

              <div className="relative">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="bg-indigo-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mb-4">1</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Build Your Audience</h3>
                <p className="text-gray-600 leading-relaxed">
                  Import your contact lists from CRM systems, spreadsheets, or create new audiences.
                  Segment and organize your subscribers for targeted campaigns.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <EnvelopeIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="bg-purple-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mb-4">2</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Create Engaging Campaigns</h3>
                <p className="text-gray-600 leading-relaxed">
                  Design beautiful, personalized emails with our drag-and-drop editor.
                  Use dynamic placeholders and templates for engaging content.
                </p>
              </div>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 group relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-50 to-transparent rounded-full -translate-y-8 translate-x-8"></div>

              <div className="relative">
                <div className="bg-gradient-to-br from-pink-500 to-red-600 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
                </div>
                <div className="bg-pink-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center mb-4">3</div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Analyze & Optimize</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor real-time delivery status and performance metrics.
                  Optimize future campaigns based on detailed analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Everything you need to run successful email campaigns, all in one powerful platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            <div className="bg-gradient-to-br from-indigo-50 to-white p-8 sm:p-10 rounded-3xl shadow-lg border border-indigo-100 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <CloudArrowUpIcon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Bulk Email Sending</h3>
              <p className="text-gray-600 leading-relaxed">
                Send thousands of personalized emails with a single click. Our powerful infrastructure ensures reliable delivery at scale.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 sm:p-10 rounded-3xl shadow-lg border border-purple-100 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Smart Personalization</h3>
              <p className="text-gray-600 leading-relaxed">
                Use dynamic placeholders and merge tags to create highly personalized emails. Improve engagement with targeted content.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-white p-8 sm:p-10 rounded-3xl shadow-lg border border-pink-100 hover:shadow-xl transition-all group">
              <div className="bg-gradient-to-br from-pink-500 to-red-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track delivery rates, open rates, click-through rates, and more. Make data-driven decisions to optimize your campaigns.
              </p>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">SMTP Configuration</h4>
              <p className="text-sm text-gray-600">Configure your own SMTP settings for complete control</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Database Integration</h4>
              <p className="text-sm text-gray-600">Connect your existing databases and CRM systems</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
              <p className="text-sm text-gray-600">Optimized for speed and reliability at any scale</p>
            </div>

            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">99.9% Uptime</h4>
              <p className="text-sm text-gray-600">Reliable infrastructure you can depend on</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 px-4 bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 sm:mb-8 leading-tight">
                Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 block">Success Story</span> Today
              </h2>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 sm:mb-10 leading-relaxed">
                Join thousands of businesses already transforming their email marketing.
                Get started free and see the difference in just 14 days.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 sm:mb-10">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3 group text-xl shadow-2xl hover:shadow-white/25 hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRightIcon className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                </Link>
                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-indigo-600 transition-all duration-300 text-xl shadow-lg hover:-translate-y-1">
                  Schedule Demo
                </button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span className="text-sm">Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Highlights */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <EnvelopeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Easy Setup</div>
                <div className="text-gray-300 text-sm">Get started in minutes</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Team Collaboration</div>
                <div className="text-gray-300 text-sm">Work together seamlessly</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-lg font-bold text-white mb-1">Detailed Analytics</div>
                <div className="text-gray-300 text-sm">Track your campaign success</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div className="text-lg font-bold text-white mb-1">Reliable Delivery</div>
                <div className="text-gray-300 text-sm">Enterprise-grade infrastructure</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
