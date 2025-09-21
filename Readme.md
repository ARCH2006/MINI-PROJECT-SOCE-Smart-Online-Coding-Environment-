online-compiler/
├── backend/                 # Express.js Application
│   ├── src/
│   │   ├── routes/
│   │   │   └── execution.js
│   │   ├── utils/
│   │   │   └── dockerEngine.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
└── frontend/                # React.js Application
    ├── src/
    │   ├── components/
    │   │   ├── CodeEditor.jsx
    │   │   ├── LanguageSelector.jsx
    │   │   └── OutputPanel.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    ├── package.json
    └── .env
