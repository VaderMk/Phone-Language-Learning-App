export const speakGerman = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  // Specify German
  utterance.lang = 'de-DE';
  // Slightly slower rate for learning
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  
  window.speechSynthesis.speak(utterance);
};
