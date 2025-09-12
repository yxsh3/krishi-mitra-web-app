import Head from 'next/head';
import Header from '../components/Header';

export default function Feedback() {
  return (
    <>
      <Head>
        <title>Feedback - Krishi Mitra</title>
        <meta name="description" content="Share your experience and suggestions" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Feedback
            </h1>
            <p className="text-lg text-gray-600">
              Help us improve by sharing your experience and suggestions
            </p>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Feedback System Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                Share your experience, report issues, or suggest new features 
                to help us make Krishi Mitra better for all farmers.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-800">
                  <strong>Your Voice Matters</strong> - Help shape the future of farming technology
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
