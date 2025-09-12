import { useState, useRef } from 'react';
import Head from 'next/head';
import Header from '../components/Header';

export default function PestDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setResponse(null);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/pest', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze image');
      }

      setResponse(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResponse(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Draw bounding boxes on canvas
  const drawBoundingBoxes = (canvas, detections) => {
    if (!detections || detections.length === 0) return;

    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Draw bounding boxes
      detections.forEach((detection, index) => {
        const { bbox, label, confidence } = detection;
        const { x, y, width, height } = bbox;
        
        // Choose color based on confidence
        const color = confidence > 0.8 ? '#ef4444' : confidence > 0.6 ? '#f59e0b' : '#10b981';
        
        // Draw rectangle
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Draw label background
        const labelText = `${label} (${Math.round(confidence * 100)}%)`;
        const textMetrics = ctx.measureText(labelText);
        const textWidth = textMetrics.width;
        const textHeight = 20;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y - textHeight, textWidth + 10, textHeight);
        
        // Draw label text
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(labelText, x + 5, y - 5);
      });
    };
    
    img.src = preview;
  };

  return (
    <>
      <Head>
        <title>Pest Detection - Krishi Mitra</title>
        <meta name="description" content="Identify pests and diseases in your crops" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pest Detection
            </h1>
            <p className="text-lg text-gray-600">
              Upload an image to identify pests and diseases in your crops
            </p>
          </div>

          {/* Upload Form */}
          <div className="card mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Input */}
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Image / चित्र चुनें
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    accept="image/*"
                    capture="camera"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    disabled={loading}
                  >
                    📷 Take Photo
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Take a photo with your camera or upload an image file
                </p>
              </div>

              {/* Image Preview */}
              {preview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview / पूर्वावलोकन
                  </label>
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-w-full h-auto max-h-96 rounded-lg border border-gray-300"
                    />
                    {response?.detections && response.detections.length > 0 && (
                      <canvas
                        className="absolute top-0 left-0 max-w-full h-auto max-h-96 rounded-lg"
                        style={{ maxWidth: '100%', height: 'auto' }}
                        ref={(canvas) => {
                          if (canvas && response.detections) {
                            drawBoundingBoxes(canvas, response.detections);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={!selectedFile || loading}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Analyzing...' : 'Analyze Image'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="card mb-8 bg-red-50 border-red-200">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Results Display */}
          {response && (
            <div className="card">
              <div className="space-y-6">
                {/* Detection Results */}
                {response.detections && response.detections.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detection Results / पहचान परिणाम
                    </h3>
                    <div className="grid gap-4">
                      {response.detections.map((detection, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 capitalize">
                              {detection.label}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              detection.confidence > 0.8 
                                ? 'bg-red-100 text-red-800' 
                                : detection.confidence > 0.6 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {Math.round(detection.confidence * 100)}% confidence
                            </span>
                          </div>
                          {detection.bbox && (
                            <div className="text-sm text-gray-600">
                              <p>Location: x={detection.bbox.x}, y={detection.bbox.y}</p>
                              <p>Size: {detection.bbox.width} × {detection.bbox.height} pixels</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Pests Detected
                    </h3>
                    <p className="text-gray-600">
                      Great! No pests or diseases were detected in your image.
                    </p>
                  </div>
                )}

                {/* Suggestions */}
                {response.suggestions && response.suggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recommendations / सिफारिशें
                    </h3>
                    <ul className="space-y-3">
                      {response.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="text-green-600 mt-1">💡</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* File Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">File Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Filename:</strong> {response.filename}</p>
                    <p><strong>Size:</strong> {(response.size / 1024).toFixed(1)} KB</p>
                    <p><strong>Source:</strong> {response.source}</p>
                    {response.warning && (
                      <p className="text-yellow-600"><strong>Note:</strong> {response.warning}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="card mt-8 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              How to Use / कैसे उपयोग करें
            </h3>
            <ul className="text-blue-800 space-y-2">
              <li>• Take a clear photo of the affected plant part (leaves, stems, fruits)</li>
              <li>• Ensure good lighting and focus for better detection accuracy</li>
              <li>• Include multiple angles if possible for comprehensive analysis</li>
              <li>• The AI will identify pests, diseases, and provide treatment suggestions</li>
            </ul>
          </div>
        </main>
      </div>
    </>
  );
}
