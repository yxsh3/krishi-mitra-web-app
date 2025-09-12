import Head from 'next/head';
import Header from '../components/Header';

export default function Market() {
  return (
    <>
      <Head>
        <title>Market Prices - Krishi Mitra</title>
        <meta name="description" content="Track current market prices for your produce" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Market Prices
            </h1>
            <p className="text-lg text-gray-600">
              Track current market prices and trends for your agricultural produce
            </p>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                Market Data Coming Soon
              </h2>
              <p className="text-gray-600 mb-6">
                Get real-time market prices, price trends, and market analysis 
                to help you make informed selling decisions.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>Market Intelligence</strong> - Maximize your profits with data-driven insights
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
