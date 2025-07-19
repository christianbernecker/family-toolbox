'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Email } from '../../../../types/email-agent';

export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchEmail(params.id as string);
    }
  }, [params.id]);

  const fetchEmail = async (emailId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/email-agent/emails/${emailId}`);
      
      if (!response.ok) {
        throw new Error('E-Mail nicht gefunden');
      }
      
      const data = await response.json();
      setEmail(data.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der E-Mail');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRelevanceFeedback = async (score: number) => {
    if (!email) return;

    try {
      const response = await fetch('/api/email-agent/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'relevance',
          targetId: email.id,
          rating: score,
          feedbackText: `Manuelle Bewertung: ${score}/10`,
          userId: 'current-user' // TODO: Get from auth
        }),
      });

      if (response.ok) {
        // Update local state
        setEmail(prev => prev ? { ...prev, relevance_score: score } : null);
        alert(`Relevanz auf ${score}/10 gesetzt`);
      } else {
        throw new Error('Fehler beim Speichern der Bewertung');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Speichern');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-red-800 mb-2">Fehler</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleBack}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h1 className="text-xl font-semibold text-yellow-800 mb-2">E-Mail nicht gefunden</h1>
            <button
              onClick={handleBack}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Zurück
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            
            {/* Relevanz-Bewertung */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Relevanz bewerten:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <button
                    key={score}
                    onClick={() => handleRelevanceFeedback(score)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                      email.relevance_score === score
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{email.subject}</h1>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium">Von:</span> {email.sender_name || 'Unbekannt'} &lt;{email.sender_email}&gt;
            </div>
            <div>
              <span className="font-medium">Empfangen:</span> {new Date(email.received_at).toLocaleString('de-DE')}
            </div>
            <div>
              <span className="font-medium">Kategorie:</span> {email.category || 'Nicht kategorisiert'}
            </div>
            {email.relevance_score && (
              <div>
                <span className="font-medium">Relevanz:</span> {email.relevance_score}/10
              </div>
            )}
          </div>
        </div>

        {/* E-Mail Inhalt */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {email.body_html ? (
            <div 
              className="p-6"
              dangerouslySetInnerHTML={{ __html: email.body_html }}
            />
          ) : (
            <div className="p-6">
              <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm">
                {email.body_text || 'Kein Inhalt verfügbar'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 