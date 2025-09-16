// Audio analysis service as a module of pure functions.

const API_BASE_URL = '/api';

/**
 * Mocks analysis data for development.
 * @param {File} audioFile - The audio file to analyze.
 * @returns {Promise<Object>} A mock analysis result.
 */
export async function mockAnalyzeAudio(audioFile) {
  console.log(`[AudioAnalysis] Mock analyzing: ${audioFile.name}`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  const mockData = {
    jazz: {
      code: `tempo: 120\nkey: Bb_major\ntime_signature: 4/4\n\nsection verse {\n  chord_progression: [Bbmaj7, Gm7, Cm7, F7]\n  rhythm: swing_eighths\n  duration: 8_bars\n}`,
      analysis: { key: "Bb major", tempo: 120, timeSignature: "4/4", chords: ["Bbmaj7", "Gm7", "Cm7", "F7"] }
    },
    rock: {
      code: `tempo: 140\nkey: E_minor\ntime_signature: 4/4\n\nsection main {\n  chord_progression: [Em, C, G, D]\n  rhythm: quarter_notes\n  duration: 8_bars\n}`,
      analysis: { key: "E minor", tempo: 140, timeSignature: "4/4", chords: ["Em", "C", "G", "D"] }
    },
    default: {
      code: `tempo: 120\nkey: C_major\ntime_signature: 4/4\n\nsection main {\n  chord_progression: [C, Am, F, G]\n  rhythm: quarter_notes\n  duration: 16_bars\n}`,
      analysis: { key: "C major", tempo: 120, timeSignature: "4/4", chords: ["C", "Am", "F", "G"] }
    }
  };

  const fileName = audioFile.name.toLowerCase();
  const type = Object.keys(mockData).find(key => fileName.includes(key)) || 'default';
  const selectedMock = mockData[type];
  
  return {
    success: true,
    chordCraftCode: `// Generated from: ${audioFile.name}\n${selectedMock.code}`,
    analysis: selectedMock.analysis
  };
}

/**
 * Analyzes an audio file by sending it to the backend API.
 * @param {File} audioFile - The audio file to analyze.
 * @returns {Promise<Object>} The analysis result from the API.
 */
export async function analyzeAudio(audioFile) {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);

    const response = await fetch(`${API_BASE_URL}/analyze`, { method: 'POST', body: formData });
    if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
    
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'An unknown analysis error occurred.');

    const { chordCraftCode, code, analysis, key, tempo, timeSignature, chords, melody } = result;

    return {
      success: true,
      chordCraftCode: chordCraftCode || code,
      analysis: analysis || { key: key || 'C major', tempo: tempo || 120, timeSignature: timeSignature || '4/4', chords: chords || [], melody: melody || [] }
    };
  } catch (error) {
    console.error('[AudioAnalysis] Error:', error);
    return { success: false, error: error.message };
  }
}
