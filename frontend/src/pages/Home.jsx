import { Link } from "react-router-dom";
import { ArrowRightIcon, ChartBarIcon, EnvelopeIcon, UserGroupIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";

function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 text-white py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 tracking-tight">
            Automate Your Email Campaigns Like Never Before
          </h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-8 sm:mb-10 opacity-90">
            This platform helps you create, personalize, and send bulk email campaigns with ease. 
            Save time, increase engagement, and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8 sm:mt-10">
            <Link
              to="/signup"
              className="px-5 py-2 sm:px-6 sm:py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-300 flex items-center justify-center gap-2 group text-sm sm:text-base"
            >
              Get Started Free
              <ArrowRightIcon className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Our streamlined process makes email automation simple and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-12">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mb-6 sm:mb-8">
                <UserGroupIcon className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">1. Build Your Audience</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Upload your contact lists (CSV files exported from your CRM) and create new ones.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mb-6 sm:mb-8">
                <EnvelopeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">2. Create Engaging Campaigns</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Design beautiful, personalized emails with our easy-to-use editor.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1">
              <div className="bg-indigo-100 w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mb-6 sm:mb-8">
                <ChartBarIcon className="h-8 w-8 sm:h-10 sm:w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">3. Analyze & Optimize</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Monitor the status of your campaigns and see which emails were sent successfully.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-100 py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">Powerful Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg">
              Everything you need to run successful email campaigns
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center text-gray-900">
                <CloudArrowUpIcon className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 mr-3" />
                Bulk Email Sending
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Send personalized emails to thousands of recipients with a single click. 
                Our platform handles the heavy lifting for you.
              </p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Personalization
              </h3>
              <p className="text-gray-600">
                Use dynamic placeholders to personalize each email with recipient-specific information 
                for higher engagement.
              </p>
            </div>
          </div>
          <div className="flex justify-center mt-8 sm:mt-10">
            <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
               Send Statistics
              </h3>
              <p className="text-gray-600">
                Track delivery status with our campaign dashboard. 
                Monitor your email sending results.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 sm:p-12 md:p-16 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Ready to Transform Your Email Marketing?</h2>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-8 sm:mb-10 text-base sm:text-lg">
            Automate your emails easier by joining our platform.
          </p>
          <Link
            to="/signup"
            className="px-6 py-2 sm:px-8 sm:py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition duration-300 inline-flex items-center text-base sm:text-lg"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
