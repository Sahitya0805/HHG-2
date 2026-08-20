import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import BackgroundSVGs from './components/BackgroundSVGs.jsx';
import VoiceRecorder from './components/VoiceRecorder.jsx';
import PipelineVisualizer from './components/PipelineVisualizer.jsx';
import AnswerCard from './components/AnswerCard.jsx';
import EvidenceViewer from './components/EvidenceViewer.jsx';
import BenchmarkDashboard from './components/BenchmarkDashboard.jsx';
import SystemStatus from './components/SystemStatus.jsx';
import { askText, askVoice, getHealth } from './lib/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState('metadata_aware');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth().then(setHealth).catch((e) => setError(e.message));
  }, []);

  const runText = useCallback(async (query) => {
    if (!query?.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      setResult(await askText(query.trim(), strategy));
    } catch (e) {
      setError(e.message);
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [strategy]);

  const runVoice = useCallback(async (blob) => {
    setIsProcessing(true);
    setError(null);
    try {
      setResult(await askVoice(blob, strategy));
    } catch (e) {
      // 503 = no SARVAM_API_KEY. Say so instead of quietly falling back.
      setError(
        e.status === 503
          ? 'Voice transcription is unavailable: the server has no Sarvam API key configured. Typed questions still work.'
          : e.message,
      );
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  }, [strategy]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <BackgroundSVGs />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-container" style={{ flex: 1 }}>
        {activeTab === 'search' && (
          <>
            <VoiceRecorder
              onTextSubmit={runText}
              onVoiceSubmit={runVoice}
              isProcessing={isProcessing}
              strategy={strategy}
              setStrategy={setStrategy}
              sttConfigured={health?.stt?.configured}
              sttDetail={health?.stt?.detail}
            />
            {error && (
              <div className="glass-panel" style={{ borderColor: '#b91c1c' }}>
                <strong style={{ color: '#b91c1c' }}>Error</strong>
                <p style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{error}</p>
              </div>
            )}
            <PipelineVisualizer isProcessing={isProcessing} result={result} />
            <AnswerCard result={result} />
          </>
        )}

        {activeTab === 'evidence' && <EvidenceViewer result={result} />}
        {activeTab === 'benchmark' && <BenchmarkDashboard />}
        {activeTab === 'status' && <SystemStatus />}
      </main>

      <footer
        style={{
          borderTop: '2.5px solid var(--card-border)', padding: '1.25rem 2rem',
          textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)', position: 'relative', zIndex: 10,
          background: 'rgba(253, 246, 227, 0.95)', fontWeight: '700',
        }}
      >
        EchoRAG · ai4bharat/MSMARCO-XI · Sarvam STT · HH Goa 2026 #RAGInGoa
      </footer>
    </div>
  );
}
