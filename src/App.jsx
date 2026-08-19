import React, { useState } from 'react';
import Header from './components/Header.jsx';
import BackgroundSVGs from './components/BackgroundSVGs.jsx';
import VoiceRecorder from './components/VoiceRecorder.jsx';
import PipelineVisualizer from './components/PipelineVisualizer.jsx';
import AnswerCard from './components/AnswerCard.jsx';
import EvidenceViewer from './components/EvidenceViewer.jsx';
import BenchmarkDashboard from './components/BenchmarkDashboard.jsx';
import SystemStatus from './components/SystemStatus.jsx';
import { executeEchoRAGPipeline } from './lib/ragEngine.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('search');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState('semantic');
  const [removeFillers, setRemoveFillers] = useState(true);

  // Pre-load default initial search result so page is never empty on load
  const [pipelineData, setPipelineData] = useState(() =>
    executeEchoRAGPipeline("What causes the symptoms of influenza and seasonal flu?", "semantic", true)
  );

  const handleTranscriptSubmit = (transcriptText) => {
    if (!transcriptText || !transcriptText.trim()) return;

    setIsProcessing(true);

    setTimeout(() => {
      const result = executeEchoRAGPipeline(transcriptText, activeStrategy, removeFillers);
      setPipelineData(result);
      setIsProcessing(false);
    }, 120);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <BackgroundSVGs />
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-container" style={{ flex: 1 }}>
        {activeTab === 'search' && (
          <>
            <VoiceRecorder
              onTranscriptSubmit={handleTranscriptSubmit}
              isProcessing={isProcessing}
              activeStrategy={activeStrategy}
              setActiveStrategy={setActiveStrategy}
              removeFillers={removeFillers}
              setRemoveFillers={setRemoveFillers}
            />
            <PipelineVisualizer isProcessing={isProcessing} pipelineData={pipelineData} />
            <AnswerCard data={pipelineData} />
          </>
        )}

        {activeTab === 'evidence' && <EvidenceViewer pipelineData={pipelineData} />}

        {activeTab === 'benchmark' && <BenchmarkDashboard />}

        {activeTab === 'status' && <SystemStatus />}
      </main>

      <footer
        style={{
          borderTop: '2.5px solid var(--card-border)',
          padding: '1.25rem 2rem',
          textAlign: 'center',
          color: 'var(--ink-muted)',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-mono)',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(253, 246, 227, 0.95)',
          fontWeight: '700'
        }}
      >
        EchoRAG Engine · Built for HH Goa 2026 (#RAGInGoa) · Sub-200ms Voice RAG Engine
      </footer>
    </div>
  );
}
