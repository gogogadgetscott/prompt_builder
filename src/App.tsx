import { useState, useMemo, useEffect } from 'react';
import './App.css';
import './components/ActiveRecipeStyles.css';
import './components/MultiModelStyles.css';
import { RecipeSelector, type Recipe } from './components/RecipeSelector/RecipeSelector';
import { PromptInput } from './components/PromptInput/PromptInput';
import { Controls } from './components/Controls/Controls';
import { Settings } from './components/Settings/Settings';

const DEFAULT_RECIPES: Recipe[] = [
  { id: 'rephrase', label: 'Rephrase', category: 'Editing', template: 'Rephrase the following text:' },
  { id: 'summarize', label: 'Summarize', category: 'Reading', template: 'Summarize this text:' },
  { id: 'bullet', label: 'Bullet Points', category: 'Formatting', template: 'Convert this text into bullet points:' },
  { id: 'profesh', label: 'Polite', category: 'Editing', template: 'Make this text sound more professional:' },
];

function App() {
  // State for Navigation
  const [showSettings, setShowSettings] = useState(false);

  // State for Recipes (persisted)
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('gemini_recipes');
    return saved ? JSON.parse(saved) : DEFAULT_RECIPES;
  });

  // Save recipes whenever they change
  useEffect(() => {
    localStorage.setItem('gemini_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const [template, setTemplate] = useState('');
  const [activeRecipeName, setActiveRecipeName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [tone, setTone] = useState('');
  const [length, setLength] = useState('');

  // Multi-Model State
  const [currentView, setCurrentView] = useState<'gemini' | 'chatgpt' | 'perplexity' | 'split' | 'all'>('gemini');
  const [target, setTarget] = useState<'gemini' | 'chatgpt' | 'perplexity' | 'both' | 'all'>('gemini');

  useEffect(() => {
    // @ts-ignore
    window.electronAPI?.setView(currentView);
  }, [currentView]);



  const finalPrompt = useMemo(() => {
    const parts = [];
    if (template) parts.push(template);
    if (userInput) parts.push(userInput);

    let instructions = [];
    if (tone) instructions.push(`Tone: ${tone}`);
    if (length) instructions.push(`Length: ${length}`);

    if (instructions.length > 0) {
      parts.push(`\n[Instructions: ${instructions.join(', ')}]`);
    }

    return parts.join('\n\n');
  }, [template, userInput, tone, length]);

  const handleSubmit = () => {
    // We will implement IPC later
    console.log("Submitting:", finalPrompt, target);
    // @ts-ignore
    if (window.electronAPI) {
      // @ts-ignore
      window.electronAPI.submitPrompt({ text: finalPrompt, target });
    }
  };

  const handleRecipeSelect = (tmpl: string, name: string) => {
    setTemplate(tmpl);
    setActiveRecipeName(name);
  };

  const clearRecipe = () => {
    setTemplate('');
    setActiveRecipeName('');
  };

  return (
    <div className="main-container p-4 flex flex-col h-screen" style={{ width: '400px', height: '100vh', overflow: 'hidden' }}>
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>Prompt Builder</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Multi-Model Edition</div>
          </div>
          {!showSettings && (
            <button
              onClick={() => setShowSettings(true)}
              className="icon-btn"
              title="Settings"
              style={{ fontSize: '16px' }}
            >
              ⚙️
            </button>
          )}
        </div>

        {/* View Switcher */}
        {!showSettings && (
          <div className="view-switcher">
            <button
              className={`view-btn ${currentView === 'gemini' ? 'active' : ''}`}
              onClick={() => setCurrentView('gemini')}
            >
              Gemini
            </button>
            <button
              className={`view-btn ${currentView === 'chatgpt' ? 'active' : ''}`}
              onClick={() => setCurrentView('chatgpt')}
            >
              ChatGPT
            </button>
            <button
              className={`view-btn ${currentView === 'perplexity' ? 'active' : ''}`}
              onClick={() => setCurrentView('perplexity')}
            >
              Perplexity
            </button>
            <button
              className={`view-btn ${currentView === 'split' ? 'active' : ''}`}
              onClick={() => setCurrentView('split')}
            >
              Split (2)
            </button>
            <button
              className={`view-btn ${currentView === 'all' ? 'active' : ''}`}
              onClick={() => setCurrentView('all')}
            >
              All (3)
            </button>
          </div>
        )}
      </header>

      {showSettings ? (
        <Settings
          recipes={recipes}
          onSave={setRecipes}
          onClose={() => setShowSettings(false)}
        />
      ) : (
        <div className="flex-1 overflow-auto flex flex-col">
          <RecipeSelector recipes={recipes} onSelect={handleRecipeSelect} />

          <div className="mb-4">
            <label className="section-label">Your Content</label>

            {activeRecipeName && (
              <div className="active-recipe-banner">
                <span>Using: <strong>{activeRecipeName}</strong></span>
                <button onClick={clearRecipe} className="clear-recipe-btn">×</button>
              </div>
            )}

            <PromptInput
              value={userInput}
              onChange={setUserInput}
              placeholder={template ? "Paste content here..." : "Type your prompt..."}
            />
          </div>

          <Controls
            tone={tone}
            setTone={setTone}
            length={length}
            setLength={setLength}
          />

          <div className="spacer flex-1" />

          <div className="footer mt-4">
            <div className="target-select mb-2">
              <label>Send to:</label>
              <select value={target} onChange={(e) => setTarget(e.target.value as any)}>
                <option value="gemini">Gemini</option>
                <option value="chatgpt">ChatGPT</option>
                <option value="perplexity">Perplexity</option>
                <option value="both">Split (G+C)</option>
                <option value="all">All (G+C+P)</option>
              </select>
            </div>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!finalPrompt}
            >
              Run Prompt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for specific App layout needs or put in a CSS file
// We'll add a style tag or file for these few extra classes
export default App;
