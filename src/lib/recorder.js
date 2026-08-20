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

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  return {
    stop: () =>
      new Promise((resolve) => {
        recorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: mimeType || 'audio/webm' }));
        };
        recorder.stop();
      }),
    cancel: () => {
      try { recorder.stop(); } catch { /* already stopped */ }
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}
