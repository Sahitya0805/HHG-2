// MediaRecorder -> blob -> backend -> Sarvam. Not the browser
// SpeechRecognition API: the brief wants Sarvam, and using the browser one
// while labelling it "Sarvam" would be a lie.

export function isRecordingSupported() {
  return !!(navigator.mediaDevices && window.MediaRecorder);
}

function pickMimeType() {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
  });
  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  const audioContext = AudioContextCtor ? new AudioContextCtor() : null;
  const analyser = audioContext ? audioContext.createAnalyser() : null;
  const source = audioContext ? audioContext.createMediaStreamSource(stream) : null;

  if (analyser && source) {
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
  }

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  const cleanup = () => {
    try { source?.disconnect(); } catch { /* already disconnected */ }
    stream.getTracks().forEach((t) => t.stop());
    if (audioContext && audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  };

  return {
    stream,
    analyser,
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          cleanup();
          resolve(new Blob(chunks, { type: mimeType || 'audio/webm' }));
        };
        recorder.stop();
      }),
    cancel: () => {
      try { recorder.stop(); } catch { /* already stopped */ }
      cleanup();
    },
  };
}
