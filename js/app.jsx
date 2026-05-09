/**
 * H7 Racing — Tweaks Panel
 * Wires up the live-edit controls to CSS custom properties and DOM nodes.
 * Loaded via Babel standalone — no build step required.
 */

const { useEffect } = React;
const { TweaksPanel, TweakSection, TweakColor, TweakText, TweakToggle } = window;
const useTweaks = window.useTweaks;

const DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent":   "#e10a1a",
  "bg":       "#0a0a0a",
  "first":    "H7",
  "last":     "RACING",
  "showGlow": true
}/*EDITMODE-END*/;

function App() {
  const [t, setT] = useTweaks(DEFAULTS);

  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', t.accent);
    r.setProperty('--bg', t.bg);

    document.getElementById('brandName').innerHTML =
      `<span>${t.first}</span><span>${t.last}</span>`;

    document.querySelector('.glow').style.display = t.showGlow ? '' : 'none';
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Identity">
        <TweakText label="Line 1" value={t.first} onChange={v => setT('first', v.toUpperCase())} />
        <TweakText label="Line 2" value={t.last}  onChange={v => setT('last',  v.toUpperCase())} />
      </TweakSection>
      <TweakSection title="Color">
        <TweakColor
          label="Accent"
          value={t.accent}
          options={['#e10a1a', '#ff2d3d', '#c00010', '#ff5b1f', '#ffffff']}
          onChange={v => setT('accent', v)}
        />
        <TweakColor
          label="Background"
          value={t.bg}
          options={['#0a0a0a', '#000000', '#111111', '#1a1a1a', '#161412']}
          onChange={v => setT('bg', v)}
        />
      </TweakSection>
      <TweakSection title="Atmosphere">
        <TweakToggle label="Soft red glow" value={t.showGlow} onChange={v => setT('showGlow', v)} />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<App />);
