import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import BackgroundSVGs from './components/BackgroundSVGs.jsx';
import VoiceRecorder from './components/VoiceRecorder.jsx';
import PipelineVisualizer from './components/PipelineVisualizer.jsx';
import AnswerCard from './components/AnswerCard.jsx';
import EvidenceViewer from './components/EvidenceViewer.jsx';
import BenchmarkDashboard from './components/BenchmarkDashboard.jsx';
import SystemStatus from './components/SystemStatus.jsx';
import VideoPlayerModal from './components/VideoPlayerModal.jsx';
import { askText, askVoice, getBenchmark, getHealth, getStrategies } from './lib/api.js';

function normalizeTab(tab) {
  return ['ask', 'evidence', 'benchmarks', 'system'].includes(tab) ? tab : 'ask';
}

export default function App() {
  const [activeTab, setActiveTab] = useState('ask');
  const [isProcessing, setIsProcessing] = useState(false);
  const [strategy, setStrategy] = useState('metadata_aware');
  const [language, setLanguage] = useState('hi-IN');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('idle');
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [benchmark, setBenchmark] = useState(null);
  const [benchmarkError, setBenchmarkError] = useState(null);
  const [strategies, setStrategies] = useState([]);
  const [focusCitation, setFocusCitation] = useState(null);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const evidenceRef = useRef(null);

  useEffect(() => {
    getHealth().then((data) => {
      setHealth(data);
      setHealthError(null);
    }).catch((e) => setHealthError(e.message));
    getBenchmark().then((data) => {
      setBenchmark(data);
      setBenchmarkError(null);
    }).catch((e) => setBenchmarkError(e.message));
    getStrategies().then((data) => setStrategies(data.strategies || [])).catch(() => {});
  }, []);

  const runText = useCallback(async (query) => {
    if (!query?.trim()) return;
    setIsProcessing(true);
    setPhase('retrieving');
    setError(null);
    try {
      const nextResult = await askText(query.trim(), strategy);
      setResult(nextResult);
      setPhase(nextResult.abstained ? 'abstained' : 'answered');
    } catch (e) {
      setError(e.message);
      setResult(null);
      setPhase('error');
    } finally {
      setIsProcessing(false);
    }
  }, [strategy]);

  const runVoice = useCallback(async (blob) => {
    setIsProcessing(true);
    setPhase('transcribing');
    setError(null);
    try {
      const nextResult = await askVoice(blob, strategy, language);
      setResult(nextResult);
      setPhase(nextResult.abstained ? 'abstained' : 'answered');
    } catch (e) {
      setError(
        e.status === 503
          ? 'Voice transcription is unavailable: the server has no Sarvam API key configured. Typed questions still work.'
          : e.message,
      );
      setResult(null);
      setPhase('error');
    } finally {
      setIsProcessing(false);
    }
  }, [language, strategy]);

  const selectTab = useCallback((tab) => setActiveTab(normalizeTab(tab)), []);

  const handleCitationClick = useCallback((chunkId) => {
    setFocusCitation(chunkId);
    setActiveTab('evidence');
    window.requestAnimationFrame(() => evidenceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  return (
    <div className="app-shell">
      <BackgroundSVGs />
      <Header
        activeTab={activeTab}
        setActiveTab={selectTab}
        health={health}
        healthError={healthError}
        onOpenVideo={(type) => setActiveVideoModal(type)}
      />

      {activeVideoModal && (
        <VideoPlayerModal videoType={activeVideoModal} onClose={() => setActiveVideoModal(null)} />
      )}

      <main className="main-container">
        {activeTab === 'ask' && (
          <>
            <VoiceRecorder
              onTextSubmit={runText}
              onVoiceSubmit={runVoice}
              isProcessing={isProcessing}
              phase={phase}
              strategy={strategy}
              setStrategy={setStrategy}
              strategies={strategies}
              language={language}
              setLanguage={setLanguage}
              sttConfigured={health?.stt?.configured}
              sttDetail={health?.stt?.detail}
              backendUnavailable={healthError}
              benchmark={benchmark}
              benchmarkError={benchmarkError}
            />
            {error && (
              <div className="notice-panel danger" role="alert">
                <strong>Request could not finish</strong>
                <p>{error}</p>
              </div>
            )}
            <PipelineVisualizer isProcessing={isProcessing} result={result} />
            <AnswerCard result={result} onCitationClick={handleCitationClick} />
            <BenchmarkDashboard compact selectedStrategy={strategy} report={benchmark} error={benchmarkError} strategies={strategies} />
          </>
        )}

        {activeTab === 'evidence' && (
          <section ref={evidenceRef}>
            <EvidenceViewer result={result} focusCitation={focusCitation} />
          </section>
        )}
        {activeTab === 'benchmarks' && <BenchmarkDashboard selectedStrategy={strategy} strategies={strategies} />}
        {activeTab === 'system' && <SystemStatus />}
      </main>

      <footer className="app-footer">
        <img src="/hhgoa/backgrounds/waveform-tide.svg" alt="" aria-hidden="true" />
        <span>EchoRAG / Task 02 · ai4bharat/MSMARCO-XI · Sarvam STT · HHGoa 2026 · #RAGInGoa</span>
      </footer>
    </div>
  );
}

