// This utility handles conversion between the text code and the note object array
export const parseChordCraftCode = (code) => {
    const lines = code.split('\n');
    const playCommands = lines.filter(line => line.trim().startsWith('PLAY'));
    const notes = [];

    playCommands.forEach((cmd, index) => {
        const parts = cmd.split(/\s+/); // Split by any whitespace
        try {
            if (parts[0] === 'PLAY' && parts.length >= 6) {
                const pitch = parts[1];
                const duration = parseFloat(parts[3].replace('s', ''));
                const startTime = parseFloat(parts[5].replace('s', ''));
                const velocity = parts[7] ? parseFloat(parts[7]) : 0.8; // Optional velocity

                if (!isNaN(duration) && !isNaN(startTime)) {
                    notes.push({ id: `note-${Date.now()}-${index}`, pitch, duration, startTime, velocity });
                }
            }
        } catch (error) {
            console.error("Could not parse line:", cmd, error);
        }
    });
    return notes;
};

export const generateChordCraftCode = (notes) => {
    if (!notes || notes.length === 0) {
        return "// No notes to generate code from.";
    }

    const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

    const codeLines = sortedNotes.map(note =>
        `PLAY ${note.pitch} FOR ${note.duration.toFixed(3)}s AT ${note.startTime.toFixed(3)}s VELOCITY ${note.velocity ? note.velocity.toFixed(2) : '0.80'}`
    );

    return codeLines.join('\n');
};

// --- Audio Utility Functions ---

const PITCH_MAP = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
const MIDI_TO_NOTE_MAP = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

export const noteToMidi = (note) => {
    const pitch = note.slice(0, -1);
    const octave = parseInt(note.slice(-1));
    return PITCH_MAP[pitch] + (octave + 1) * 12;
};

export const midiToNote = (midi) => {
    const octave = Math.floor(midi / 12) - 1;
    const pitchIndex = midi % 12;
    return `${MIDI_TO_NOTE_MAP[pitchIndex]}${octave}`;
};

export const getNoteFrequency = (note) => {
    const midi = noteToMidi(note);
    // Frequency for A4 (MIDI 69) is 440 Hz
    return 440 * Math.pow(2, (midi - 69) / 12);
};

export const snapToGrid = (value, resolution, tempo) => {
    const beatDuration = 60 / tempo; // Duration of one beat in seconds
    const gridUnit = beatDuration / resolution; // Duration of one grid unit
    return Math.round(value / gridUnit) * gridUnit;
};

export const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 100);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};
