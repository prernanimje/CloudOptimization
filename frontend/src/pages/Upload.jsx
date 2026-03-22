/**
 * Upload Page - For uploading CSV files with server data
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { uploadAPI } from '../api';
import { generateGeminiResponse } from '../services/gemini';
import '../styles/UploadStyle.css';

export const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-redirect to dashboard after successful upload
  useEffect(() => {
    if (uploadResult?.success) {
      const timer = setTimeout(() => {
        navigate('/app');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [uploadResult, navigate]);

  const exampleCSV = `name,cpu_usage,ram_usage,storage_usage,storage_capacity,uptime_hours,downtime_hours,region,monthly_cost,status
web-server-1,45,60,70,50,720,0,us-east-1,150.00,healthy
web-server-2,15,20,80,100,700,20,us-west-2,120.00,healthy
db-server-1,85,92,90,500,650,70,eu-west-1,300.00,healthy
cache-server,8,10,30,50,720,0,ap-south-1,80.00,healthy
mail-server,35,45,50,100,690,30,us-east-1,100.00,healthy`;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAiRecommendation(null);

      const fileText = await file.text();
      const result = await uploadAPI.uploadCSV(file);
      setUploadResult(result);
      setFile(null);

      // Refresh instances list in local storage or trigger a refresh event
      if (result.success) {
        window.dispatchEvent(new Event('instancesUpdated'));

        // Trigger AI analysis on the uploaded text
        setAiLoading(true);
        try {
          const aiResponse = await generateGeminiResponse(
            "Please analyze this uploaded server data. Look for changes, resource hogs, and give concise suggestions to optimize costs and usage based purely on this CSV upload.",
            { name: "Global Upload Analysis" },
            fileText
          );
          setAiRecommendation(aiResponse);
        } catch (aiErr) {
          const errMsg = aiErr.message || '';
          if (errMsg.includes('429') || errMsg.includes('Quota exceeded')) {
            setAiRecommendation("### Free Tier Limit Reached\n\nGoogle Gemini's free tier quota has been temporarily exhausted. Please retry in a few minutes, or upgrade your API plan to process larger batch uploads! \n\n*Your data was successfully saved to the database regardless.*");
          } else {
            setAiRecommendation("### AI Analysis Failed\n\nFailed to generate AI upload insights due to a secure API timeout or connection loss.");
          }
          console.error("AI Recommendation graceful catch:", aiErr);
        } finally {
          setAiLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const downloadExample = () => {
    const element = document.createElement('a');
    const file = new Blob([exampleCSV], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'example_instances.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="upload-page-container">


      {/* Main Content */}
      <div className="upload-content">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className={`mb-6 p-6 rounded-lg border-l-4 ${uploadResult.success
            ? 'bg-green-50 border-green-500'
            : 'bg-yellow-50 border-yellow-500'
            }`}>
            <div className="flex items-center gap-3 mb-3">
              {uploadResult.success ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <h3 className="text-lg font-semibold text-green-900">Upload Successful</h3>
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-600" size={24} />
                  <h3 className="text-lg font-semibold text-yellow-900">Upload Completed with Issues</h3>
                </>
              )}
            </div>
            <p className="text-gray-800 mb-3">{uploadResult.message}</p>
            <div className="text-sm space-y-1">
              <p className="text-gray-700">
                <span className="font-semibold">Created:</span> {uploadResult.instances_created} instances
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Updated:</span> {uploadResult.instances_updated} instances
              </p>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="font-semibold text-yellow-800 mb-2">Issues found:</p>
                  <ul className="space-y-1">
                    {uploadResult.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx} className="text-yellow-700 text-xs">
                        • {err}
                      </li>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <li className="text-yellow-700 text-xs">
                        • ... and {uploadResult.errors.length - 5} more issues
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Recommendations Section */}
        {aiLoading && (
          <div className="mb-6 p-6 upload-card flex items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="upload-text-strong flex items-center gap-2">
              <Bot className="text-blue-500 animate-pulse" />
              Gemini AI is analyzing your uploaded data...
            </p>
          </div>
        )}

        {aiRecommendation && !aiLoading && (
          <div className="mb-6 border border-purple-200 rounded-lg shadow-md overflow-hidden bg-[var(--bg-card)]">
            <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex items-center gap-3">
              <Bot className="text-purple-600" size={24} />
              <h3 className="text-lg font-semibold text-purple-900">AI Upload Insights</h3>
            </div>
            <div className="p-6 prose max-w-none text-[var(--text-primary)]">
              <ReactMarkdown>{aiRecommendation}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div className="upload-card stagger-card stagger-delay-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`upload-dropzone ${dragActive ? 'active' : ''}`}
          >
            <Upload className="mx-auto upload-text-muted mb-4" size={48} />
            <h3 className="upload-card-title mb-2 text-center" style={{ margin: 0 }}>
              Drop CSV file here or click to select
            </h3>
            <p className="upload-text-muted mb-4">Supported format: CSV files only</p>

            <label className="inline-block mt-4">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <span className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-sm font-semibold transition-colors">
                Browse Files
              </span>
            </label>

            {file && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg mx-auto max-w-md">
                <p className="text-blue-900 font-semibold text-left">📄 {file.name}</p>
                <p className="text-blue-700 text-sm mt-1 text-left">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Upload
                </>
              )}
            </button>
          )}
        </div>

        {/* CSV Format Guide */}
        <div className="upload-card stagger-card stagger-delay-3">
          <h2 className="upload-card-title">CSV Format Guide</h2>

          <div className="format-guide-code">
            <p>{exampleCSV}</p>
          </div>

          <div className="mb-6">
            <button
              onClick={downloadExample}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
            >
              <Download size={18} />
              Download Example CSV
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="upload-text-strong">Required Columns:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="format-list-title">Instance Data</h4>
                <ul className="space-y-1">
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">name</span> - Instance name (unique)</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">region</span> - AWS region (e.g., us-east-1)</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">monthly_cost</span> - Dollar amount</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">status</span> - healthy/warning/critical</li>
                </ul>
              </div>
              <div>
                <h4 className="format-list-title">Resource Usage</h4>
                <ul className="space-y-1">
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">cpu_usage</span> - 0-100 %</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">ram_usage</span> - 0-100 %</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">storage_usage</span> - 0-100 %</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">storage_capacity</span> - GB</li>
                </ul>
              </div>
              <div>
                <h4 className="format-list-title">Uptime Info</h4>
                <ul className="space-y-1">
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">uptime_hours</span> - Total uptime hours</li>
                  <li className="format-list-item">• <span className="font-mono upload-text-strong">downtime_hours</span> - Total downtime hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="info-alert-box stagger-card stagger-delay-4">
          <h3 className="info-alert-title">💡 Tips</h3>
          <ul className="space-y-2">
            <li className="info-alert-text">• Use the same instance names to update existing servers</li>
            <li className="info-alert-text">• CPU, RAM, and Storage values should be 0-100 (percentages)</li>
            <li className="info-alert-text">• Use valid AWS region codes (e.g., us-east-1, eu-west-1, ap-south-1)</li>
            <li className="info-alert-text">• Monthly cost should be a number (e.g., 150.00)</li>
            <li className="info-alert-text">• Headers are case-sensitive - match exactly</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;