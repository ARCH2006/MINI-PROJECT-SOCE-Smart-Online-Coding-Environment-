import { Editor } from "@monaco-editor/react";

const CodeEditor = ({ language, value, onChange }) => {
  return (
    <div className="editor">
      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        value={value}
        onChange={(val) => onChange(val || "")}
        options={{
          fontSize: 15,
          minimap: { enabled: false },
          automaticLayout: true,
          fontLigatures: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
