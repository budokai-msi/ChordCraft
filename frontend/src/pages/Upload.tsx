import React from "react";
import { useNavigate } from "react-router-dom";
import { useChordCraftStore } from "../store/useChordCraftStore";
import { SimpleFileUpload } from "../components/SimpleFileUpload";

export default function Upload() {
  const navigate = useNavigate();
  const setCode = useChordCraftStore(s => s.setCode);
  const reset = useChordCraftStore(s => s.reset);

  React.useEffect(() => reset(), [reset]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">ChordCraft Studio</h1>
        <p className="text-sm opacity-70">
          Upload any song → get ChordCraft v2 code with embedded lossless payload for <em>identical</em> playback.
        </p>
      </header>

      <SimpleFileUpload onUpload={(r) => {
        if (r.generatedCode) {
          setCode(r.generatedCode);
          navigate("/studio");
        }
      }} />
    </div>
  );
}
