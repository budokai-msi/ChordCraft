// Music API service as pure functions

const API_BASE_URL = '/api';

const codeTemplates = {
  jazz: `tempo: 120\nkey: Bb_major\ntime_signature: 4/4\n\nsection verse {\n  chord_progression: [Bbmaj7, Gm7, Cm7, F7]\n  rhythm: swing_eighths\n  duration: 8_bars\n}`,
  rock: `tempo: 140\nkey: E_minor\ntime_signature: 4/4\n\nbass_line {\n  notes: [E2, E2, G2, E2, D2, E2, G2, A2]\n  rhythm: eighth_notes\n  pattern: driving\n  duration: 4_bars\n}`,
  pentatonic: `tempo: 100\nkey: A_minor\ntime_signature: 4/4\n\nmelody {\n  scale: A_minor_pentatonic\n  notes: [A4, C5, D5, E5, G5, E5, D5, C5, A4]\n  rhythm: [quarter, eighth, eighth, quarter, quarter, eighth, eighth, quarter, half]\n  phrasing: legato\n}`,
  ambient: `tempo: 80\nkey: D_minor\ntime_signature: 4/4\n\nsection pad {\n  chord_progression: [Dm, Bb, F, C]\n  rhythm: whole_notes\n  duration: 16_bars\n  effects: [reverb: 0.8, delay: 0.3]\n}`,
  default: `tempo: 110\nkey: C_major\ntime_signature: 4/4\n\nsection main {\n  chord_progression: [C, Am, F, G]\n  rhythm: quarter_notes\n  duration: 8_bars\n}`
};

const getCodeType = (prompt) => {
  const lower = prompt.toLowerCase();
  return Object.keys(codeTemplates).find(key => lower.includes(key)) || 'default';
};

export async function generateMusic(request) {
  try {
    const response = await fetch(`${API_BASE_URL}/generative-companion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.error || 'Generation failed');

    return {
      success: true,
      chordCraftCode: result.chordCraftCode || result.code,
      explanation: result.explanation || 'Music generated successfully!'
    };
  } catch (error) {
    console.error('[MusicApiService] Error:', error);
    return { success: false, error: error.message };
  }
}

export async function mockGenerateMusic(request) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const type = getCodeType(request.prompt);
  return {
    success: true,
    chordCraftCode: `// ${type.charAt(0).toUpperCase() + type.slice(1)} Composition\n${codeTemplates[type]}`,
    explanation: `Generated a ${type} composition based on your request.`
  };
}