from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.datastructures import FileStorage
import tempfile, os, logging, time
from audio_codec import ChordCraftCodec  # your class from earlier

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("chordcraft")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://studio.yourdomain.com", "https://chord-craft-l32h.vercel.app", "https://*.vercel.app"]}})

# Security: 100MB limit (matches nginx config)
app.config["MAX_CONTENT_LENGTH"] = 100 * 1024 * 1024

# Rate limiting
limiter = Limiter(get_remote_address, app=app, default_limits=["60/min"])

# Strict MIME type validation
ALLOWED_MIME = {
    "audio/mpeg", "audio/wav", "audio/ogg", "audio/aac", 
    "audio/flac", "audio/x-flac"
}

def sniff_audio(sig: bytes) -> str:
    """Lightweight signature-based MIME detection for audio files."""
    if sig.startswith(b"fLaC"):
        return "audio/flac"
    if sig.startswith(b"ID3") or (len(sig) > 1 and sig[0] == 0xFF and (sig[1] & 0xE0) == 0xE0):
        return "audio/mpeg"  # MP3
    if sig.startswith(b"RIFF") and len(sig) > 8 and sig[8:12] == b"WAVE":
        return "audio/wav"
    if sig.startswith(b"OggS"):
        return "audio/ogg"
    if sig.startswith(b"\xFF\xF1") or sig.startswith(b"\xFF\xF9"):
        return "audio/aac"  # AAC ADTS
    return "application/octet-stream"

codec = ChordCraftCodec(target_sr=44100, stereo=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "2.0.0", "endpoints": ["/analyze", "/generate-music"]})

@app.route("/analyze", methods=["POST"])
@limiter.limit("6/min")  # Rate limit uploads
def analyze():
    """
    Music → Code: returns a ChordCraft v2 block with lossless payload.
    Response JSON:
      { success: true, code: "<ChordCraft v2 text>" }
    """
    start_time = time.time()
    
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "No 'audio' file part"}), 400

    f: FileStorage = request.files["audio"]
    if not f or f.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    # Robust MIME type validation: signature + mimetype double-check
    stream = f.stream
    head = stream.read(12)  # peek at file signature
    stream.seek(0)  # reset for actual processing
    sniffed = sniff_audio(head)
    
    if sniffed not in ALLOWED_MIME and f.mimetype not in ALLOWED_MIME:
        return jsonify({
            "success": False, 
            "error": f"Unsupported audio type (detected: {sniffed}, reported: {f.mimetype})"
        }), 415

    file_size = f.content_length or 0
    file_format = os.path.splitext(f.filename)[1] or "unknown"
    
    log.info(f"Analyzing audio: {f.filename} ({file_size} bytes, {file_format})")

    try:
        # Save to a temp file only because the codec API expects a path
        with tempfile.NamedTemporaryFile(suffix=file_format, delete=True) as tmp:
            f.save(tmp.name)

            # Produce ChordCraft code with embedded FLAC (identical playback)
            code = codec.create_chordcraft_code(
                audio_path=tmp.name,
                bpm=None,                # let codec/analysis set default if unknown
                key="Unknown",
                time_sig="4/4",
                chords=None,
                include_lossless=True,   # guarantees identical
                include_neural=False,    # optional, keep false for now
                version="cc-v2.1",       # version stamp for future compatibility
                build_date=time.strftime("%Y-%m-%d")  # build date stamp
            )

        elapsed = time.time() - start_time
        log.info(f"Analysis complete: {f.filename} ({elapsed:.2f}s, {len(code)} chars)")
        return jsonify({"success": True, "code": code})
    except Exception as e:
        elapsed = time.time() - start_time
        log.exception(f"Analysis failed: {f.filename} ({elapsed:.2f}s)")
        return jsonify({"success": False, "error": f"analysis_failed: {e}"}), 500

@app.route("/generate-music", methods=["POST"])
def generate_music():
    """
    (Optional) Code → Analysis stub. Keep your existing Muzic-inspired analyzer
    here if you like; this endpoint is not used by the uploader above.
    """
    data = request.get_json(silent=True) or {}
    code = data.get("code", "")
    if not code:
        return jsonify({"success": False, "error": "Missing 'code'"}), 400

    # Echo stub (plug your Muzic analyzer here if needed)
    return jsonify({
        "success": True,
        "message": "Received code, integrate your code→music analyzer here.",
        "chars": len(code),
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)