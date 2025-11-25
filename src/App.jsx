import { useState, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import "./App.css";
import axios from "axios";

function App() {
  const [language, setLanguage] = useState("python");
  const [sourceCode, setSourceCode] = useState("");
  const [output, setOutput] = useState("");
  const [aiExplanation, setAiExplanation] = useState("");
  const [aiHint, setAiHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [explaining, setExplaining] = useState(false);
  const [showExplain, setShowExplain] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [input, setInput] = useState("");
  

  const languageMap = { c: 50, cpp: 54, java: 62, python: 71, javascript: 63 };

  const defaultCodes = {
    c: '#include <stdio.h>\nint main() {\n    printf("Hello, C!\\n");\n    return 0;\n}',
    cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "Hello, C++!" << endl;\n    return 0;\n}',
    java: 'class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}',
    python: 'print("Hello, Python!")',
    javascript: 'console.log("Hello, JavaScript!");',
  };

  useEffect(() => {
    setSourceCode(defaultCodes[language]);
    setOutput("");
    setAiExplanation("");
    setAiHint("");
  }, [language]);

  const handleRun = async () => {
  if (!sourceCode.trim()) {
    setOutput("⚠️ Please write some code first!");
    return;
  }

  setLoading(true);
  setOutput("🚀 Running your code...");
  setAiExplanation("");
  setAiHint("");

  try {
  
    const base64Code = btoa(unescape(encodeURIComponent(sourceCode)));
    const base64Input = btoa(unescape(encodeURIComponent(input)));

    const payload = {
      source_code: base64Code,
      language_id: languageMap[language],
       stdin: base64Input,
    };

    const headers = {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": "38e060efa8msh795eff38b4ee881p1966acjsnf2d2c5c626ad",
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    };

    
    const submission = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false",
      payload,
      { headers }
    );

    const token = submission.data.token;
    if (!token) throw new Error("❌ Failed to get submission token");

    
    let result = null;
    for (let i = 0; i < 10; i++) {
      const res = await axios.get(
        `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
        { headers }
      );
      result = res.data;
      if (result.status?.id > 2) break; 
      await new Promise((r) => setTimeout(r, 1500));
    }

  
    const decode = (b64) =>
      b64 ? decodeURIComponent(escape(atob(b64))) : "";

    const compileErr = decode(result.compile_output);
    const runtimeErr = decode(result.stderr);
    const outputText = decode(result.stdout);

    if (compileErr) setOutput("❌ Compilation Error:\n" + compileErr);
    else if (runtimeErr) setOutput("❌ Runtime Error:\n" + runtimeErr);
    else if (outputText) setOutput("✅ Output:\n" + outputText);
    else setOutput(`⚠️ ${result.status?.description || "No output received"}`);
  } catch (err) {
    console.error("Judge0 Error:", err.response?.data || err.message);
    const msg =
      err.response?.data?.message ||
      err.response?.statusText ||
      err.message;
    setOutput("❌ Error: " + msg);
  }

  setLoading(false);
};


  const handleAIRequest = async (type) => {
    if (!output.startsWith("❌")) {
      if (type === "explain") setAiExplanation("⚠️ No error to explain!");
      else setAiHint("⚠️ No error to provide hints!");
      return;
    }

    setExplaining(true);

    if (type === "explain") setAiExplanation("💡 Generating...");
    else setAiHint("💡 Generating...");

    try {
      const response = await axios.post("http://localhost:5000/api/explain", {
        text: output,
        language,
        type,
      });

      if (type === "explain") setAiExplanation(response.data.explanation);
      else setAiHint(response.data.explanation);

    } catch (err) {
      if (type === "explain") setAiExplanation("❌ Failed to fetch AI explanation.");
      else setAiHint("❌ Failed to fetch hints.");
    }

    setExplaining(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>⚡ AI-Powered Online Compiler</h1>
        <p className="subtitle">Write • Compile • Run — Instantly!</p>
      </header>

      <div className="toolbar">
        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="dropdown">
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="c">C</option>
          <option value="java">Java</option>
          <option value="javascript">JavaScript</option>
        </select>

        <button className="run-btn" onClick={handleRun} disabled={loading}>
          {loading ? "⏳ Running..." : "▶ Run Code"}
        </button>

        <button className="explain-btn" onClick={() => handleAIRequest("explain")} disabled={explaining}>
          {explaining ? "🤖 Processing..." : "💡 Explain Error"}
        </button>

        <button className="hint-btn" onClick={() => handleAIRequest("hint")} disabled={explaining}>
          {explaining ? "🤖 Processing..." : "📝 Get Hint"}
        </button>

        <button className="explain-btn" onClick={() => setShowExplain(!showExplain)}>
          {showExplain ? "🔽 Hide Explanation" : "🔼 Show Explanation"}
        </button>

        <button className="hint-btn" onClick={() => setShowHint(!showHint)}>
          {showHint ? "🔽 Hide Hint" : "🔼 Show Hint"}
        </button>
      </div>

      <div className="main-section">
        <div className="editor">
          <CodeEditor language={language} value={sourceCode} onChange={setSourceCode} />
        </div>

         <div className="output-section">
          <div className="output">
                <h2>🧩 Input Console</h2>
                <textarea
                    placeholder="💬 Type input for your program (optional)..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={4}
                    disabled={loading} // Disable input while loading/running
                    style={{
                      width: "100%",
                      backgroundColor: "#1e1e1e",
                      color: "#00ff99",
                      border: "1px solid #444",
                      borderRadius: "8px",
                      padding: "10px",
                      fontFamily: "monospace",
                      opacity: loading ? 0.7 : 1, // Visual feedback when disabled
                    }}
                />

                <hr style={{ margin: "10px 0", borderTop: "1px solid #334155" }} />

                <h2>🧩 Program Output</h2>
                <pre>{output}</pre> {/* Always display the output state here */}
            </div>  

          {showExplain && (
            <div className="ai-output">
              <h2>🤖 AI Explanation</h2>
              <pre>{aiExplanation}</pre>
            </div>
          )}

          {showHint && (
            <div className="ai-output">
              <h2>📝 AI Hint</h2>
              <pre>{aiHint}</pre>
            </div>
          )}
        </div>
      </div>

      {/* <footer className="footer">⚙️ Built with ❤️ by Sanjay</footer> */}
    </div>
  );
}

export default App;
