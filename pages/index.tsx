import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';

export default function Home() {
  const features = [
    {
      title: 'AI Chat Assistant',
      description: 'Get instant answers to your farming questions',
      href: '/chat',
      icon: '💬',
      color: 'bg-blue-50 border-blue-200 text-blue-600'
    },
    {
      title: 'Weather Forecast',
      description: 'Check weather conditions for your crops',
      href: '/weather',
      icon: '🌤️',
      color: 'bg-yellow-50 border-yellow-200 text-yellow-600'
    },
    {
      title: 'Pest Detection',
      description: 'Identify pests and diseases in your crops',
      href: '/pest-detect',
      icon: '🔍',
      color: 'bg-red-50 border-red-200 text-red-600'
    },
    {
      title: 'Market Prices',
      description: 'Track current market prices for your produce',
      href: '/market',
      icon: '📈',
      color: 'bg-green-50 border-green-200 text-green-600'
    },
    {
      title: 'Feedback',
      description: 'Share your experience and suggestions',
      href: '/feedback',
      icon: '💭',
      color: 'bg-purple-50 border-purple-200 text-purple-600'
    }
  ];

  return (
    <>
      <Head>
        <title>Krishi Mitra - Your AI Farming Assistant</title>
        <meta name="description" content="AI-powered farming assistant for modern agriculture" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Welcome to{' '}
              <span className="text-green-600">Krishi Mitra</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Your AI-powered farming assistant. Get expert advice, weather updates, 
              pest detection, and market insights to maximize your agricultural success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat" className="btn-primary text-lg px-8 py-3">
                Start Chatting
              </Link>
              <Link href="/weather" className="btn-secondary text-lg px-8 py-3">
                Check Weather
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {features.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group block"
              >
                <div className={`card hover:shadow-lg transition-all duration-300 group-hover:scale-105 ${feature.color}`}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 group-hover:text-gray-700">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Choose Krishi Mitra?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">AI Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600">Mobile Responsive</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">Free</div>
                <div className="text-gray-600">To Use Forever</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Join thousands of farmers who trust Krishi Mitra for their agricultural needs.
            </p>
            <Link
              href="/chat"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 inline-block"
            >
              Get Started Now
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>&copy; 2024 Krishi Mitra. Empowering farmers with AI technology.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
