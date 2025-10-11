const OutputBox = ({ output }) => {
  return (
    <div className="output">
      <h2>🧩 Output Console</h2>
      <pre>{output}</pre>
    </div>
  );
};

export default OutputBox;
