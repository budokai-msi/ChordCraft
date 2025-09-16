from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile, os, logging
from audio_codec import ChordCraftCodec  # your class from earlier

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("chordcraft")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Optional: 80 MB limit
app.config["MAX_CONTENT_LENGTH"] = 80 * 1024 * 1024

codec = ChordCraftCodec(target_sr=44100, stereo=True)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "version": "2.0.0", "endpoints": ["/analyze", "/generate-music"]})

@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Music → Code: returns a ChordCraft v2 block with lossless payload.
    Response JSON:
      { success: true, code: "<ChordCraft v2 text>" }
    """
    if "audio" not in request.files:
        return jsonify({"success": False, "error": "No 'audio' file part"}), 400

    f = request.files["audio"]
    if not f or f.filename == "":
        return jsonify({"success": False, "error": "No selected file"}), 400

    try:
        # Save to a temp file only because the codec API expects a path
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(f.filename)[1] or ".bin", delete=True) as tmp:
            f.save(tmp.name)

            # Produce ChordCraft code with embedded FLAC (identical playback)
            code = codec.create_chordcraft_code(
                audio_path=tmp.name,
                bpm=None,                # let codec/analysis set default if unknown
                key="Unknown",
                time_sig="4/4",
                chords=None,
                include_lossless=True,   # guarantees identical
                include_neural=False     # optional, keep false for now
            )

        return jsonify({"success": True, "code": code})
    except Exception as e:
        log.exception("analysis_failed")
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