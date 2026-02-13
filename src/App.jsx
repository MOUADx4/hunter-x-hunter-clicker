import { useState, useEffect, useRef } from "react";
import ClickButton from "./components/ClickButton";
import Stats from "./components/Stats";
import AmeliorationsList from "./components/AmeliorationsList";
import { MACHINES } from "./data/machines";
import "./style.css";

function App() {
  const [username, setUsername] = useState("player");
  const [cookies, setCookies] = useState(0);
  const [productionAuto, setProductionAuto] = useState(0);
  const [multiplicateur, setMultiplicateur] = useState(1);
  const [ameliorations, setAmeliorations] = useState([]);
  const [machines, setMachines] = useState(MACHINES);
  const [totalClicks, setTotalClicks] = useState(0);
  const [success, setSuccess] = useState([]);
  const [prestigePoints, setPrestigePoints] = useState(0);

  const [darkMode, setDarkMode] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  const clickSound = useRef(null);
  const buySound = useRef(null);
  const successSound = useRef(null);

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [bonusActif, setBonusActif] = useState(false);
  const [bonusTempsRestant, setBonusTempsRestant] = useState(0);
  const bonusMultiplicateur = bonusActif ? 2 : 1;

  const [successPopup, setSuccessPopup] = useState(null);

  /* ------------------------------
      BONUS TIMER
  ------------------------------ */
  useEffect(() => {
    if (!bonusActif) return;
    const interval = setInterval(() => {
      setBonusTempsRestant((t) => {
        if (t <= 1) {
          setBonusActif(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [bonusActif]);

  const activerBonus = () => {
    if (bonusActif) return;
    setBonusActif(true);
    setBonusTempsRestant(30);
  };

  /* ------------------------------
      LOAD SAVE
  ------------------------------ */
  useEffect(() => {
    const saved = localStorage.getItem(`cookie-clicker-${username}`);
    const savedLeaderboard = localStorage.getItem("cookie-leaderboard");
    const savedDark = localStorage.getItem("cookie-darkmode");
    const savedSounds = localStorage.getItem("cookie-sounds");

    if (saved) {
      const data = JSON.parse(saved);
      setCookies(data.cookies ?? 0);
      setProductionAuto(data.productionAuto ?? 0);
      setMultiplicateur(data.multiplicateur ?? 1);
      setAmeliorations(data.ameliorations ?? []);
      setMachines(data.machines ?? MACHINES);
      setTotalClicks(data.totalClicks ?? 0);
      setSuccess(data.success ?? []);
      setPrestigePoints(data.prestigePoints ?? 0);
    }

    if (savedLeaderboard) setLeaderboard(JSON.parse(savedLeaderboard));
    if (savedDark) setDarkMode(JSON.parse(savedDark));
    if (savedSounds) setSoundsEnabled(JSON.parse(savedSounds));
  }, [username]);

  /* ------------------------------
      LOAD SOUNDS
  ------------------------------ */
  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
    buySound.current = new Audio("/sounds/buy.mp3");
    successSound.current = new Audio("/sounds/success.mp3");
  }, []);

  const playSound = (ref) => {
    if (!soundsEnabled) return;
    if (!ref.current) return;
    ref.current.currentTime = 0;
    ref.current.play().catch(() => {});
  };

  /* ------------------------------
      DARK MODE
  ------------------------------ */
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("cookie-darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

  /* ------------------------------
      AUTO SAVE
  ------------------------------ */
  useEffect(() => {
    const data = {
      cookies,
      productionAuto,
      multiplicateur,
      ameliorations,
      machines,
      totalClicks,
      success,
      prestigePoints,
    };
    localStorage.setItem(`cookie-clicker-${username}`, JSON.stringify(data));
  }, [
    cookies,
    productionAuto,
    multiplicateur,
    ameliorations,
    machines,
    totalClicks,
    success,
    prestigePoints,
    username,
  ]);

  useEffect(() => {
    localStorage.setItem("cookie-leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem("cookie-sounds", JSON.stringify(soundsEnabled));
  }, [soundsEnabled]);

  /* ------------------------------
      AUTO PRODUCTION
  ------------------------------ */
  useEffect(() => {
    const interval = setInterval(() => {
      const bonusPrestige = 1 + prestigePoints * 0.1;
      const totalBonus = bonusPrestige * bonusMultiplicateur;
      setCookies((prev) => prev + productionAuto * totalBonus);
    }, 1000);
    return () => clearInterval(interval);
  }, [productionAuto, prestigePoints, bonusMultiplicateur]);

  /* ------------------------------
      CLICK
  ------------------------------ */
  const handleClick = (e) => {
    playSound(clickSound);

    const gain = multiplicateur * bonusMultiplicateur;
    setCookies((prev) => prev + gain);
    setTotalClicks((prev) => prev + 1);

    // coordonnées safe (si e vient d'un élément interne)
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    const id = Math.random();
    setFloatingTexts((prev) => [...prev, { id, x, y, value: `+${gain}` }]);
    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  };

  /* ------------------------------
      BUY
  ------------------------------ */
  const acheter = (id, type) => {
    const setList = type === "amelioration" ? setAmeliorations : setMachines;
    let ok = false;

    setList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (cookies < item.coutActuel) return item;

        ok = true;
        setCookies((c) => c - item.coutActuel);
        setProductionAuto((p) => p + item.bonus);

        const achats = item.achats + 1;
        const newCost = Math.floor(item.coutBase * Math.pow(1.15, achats));

        return { ...item, achats, coutActuel: newCost };
      })
    );

    if (ok) playSound(buySound);
  };

  const acheterMultiplicateur = () => {
    const cout = 100 * multiplicateur;
    if (cookies < cout) return;
    playSound(buySound);
    setCookies((c) => c - cout);
    setMultiplicateur((m) => m + 1);
  };

  /* ------------------------------
      PRESTIGE
  ------------------------------ */
  const prestigeDisponible = Math.floor(cookies / 1_000_000);

  const fairePrestige = () => {
    if (prestigeDisponible <= 0) return;
    playSound(successSound);
    setPrestigePoints((p) => p + prestigeDisponible);
    setCookies(0);
    setProductionAuto(0);
    setMultiplicateur(1);
    setAmeliorations([]);
    setMachines(MACHINES);
    setTotalClicks(0);
  };

  /* ------------------------------
      SUCCESS POPUP
  ------------------------------ */
  useEffect(() => {
    const newSuccess = [];

    if (cookies >= 100 && !success.includes("100")) newSuccess.push("100");
    if (cookies >= 1000 && !success.includes("1000")) newSuccess.push("1000");
    if (cookies >= 10000 && !success.includes("10000")) newSuccess.push("10000");

    if (newSuccess.length > 0) {
      playSound(successSound);
      setSuccess((prev) => [...prev, ...newSuccess]);

      const last = newSuccess[newSuccess.length - 1];
      let label = "";
      if (last === "100") label = "🎉 100 cookies !";
      if (last === "1000") label = "🔥 1 000 cookies !";
      if (last === "10000") label = "💎 10 000 cookies !";

      setSuccessPopup(label);
      setTimeout(() => setSuccessPopup(null), 3000);
    }
  }, [cookies, success]);

  /* ------------------------------
      LEADERBOARD
  ------------------------------ */
  useEffect(() => {
    setLeaderboard((prev) => {
      const existing = prev.find((p) => p.username === username);
      if (existing) {
        if (cookies > existing.bestScore) {
          return prev.map((p) =>
            p.username === username ? { ...p, bestScore: cookies } : p
          );
        }
        return prev;
      }
      return [...prev, { username, bestScore: cookies }];
    });
  }, [cookies, username]);

  /* ------------------------------
      EXPORT / IMPORT
  ------------------------------ */
  const exporterSauvegarde = () => {
    const data = {
      cookies,
      productionAuto,
      multiplicateur,
      ameliorations,
      machines,
      totalClicks,
      success,
      prestigePoints,
      darkMode,
      soundsEnabled,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cookie-save-${username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importerSauvegarde = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setCookies(data.cookies ?? 0);
        setProductionAuto(data.productionAuto ?? 0);
        setMultiplicateur(data.multiplicateur ?? 1);
        setAmeliorations(data.ameliorations ?? []);
        setMachines(data.machines ?? MACHINES);
        setTotalClicks(data.totalClicks ?? 0);
        setSuccess(data.success ?? []);
        setPrestigePoints(data.prestigePoints ?? 0);
        setDarkMode(data.darkMode ?? false);
        setSoundsEnabled(data.soundsEnabled ?? true);
        alert("Sauvegarde importée !");
      } catch {
        alert("Erreur fichier !");
      }
    };
    reader.readAsText(file);
  };

  const bonusPrestige = 1 + prestigePoints * 0.1;
  const totalBonus = bonusPrestige * bonusMultiplicateur;
  const cps = productionAuto * multiplicateur * totalBonus;
  const cpm = cps * 60;

  /* ------------------------------
      RENDER
  ------------------------------ */
  return (
    <div className="app-root">
      {/* BACKGROUND VIDEO ANIMÉ */}
<video autoPlay loop muted className="video-bg">
  <source src="/videos/hxh-bg.mp4" type="video/mp4" />
</video>

      <div className="app-container">

        {/* HEADER */}
        <header className="app-header">
          <img
            src="/images/hxh-logo.png"
            alt="Hunter x Hunter Logo"
            className="hxh-logo"
          />

          <div className="header-actions">
            <button className="btn secondary" onClick={() => setDarkMode((d) => !d)}>
              {darkMode ? "☀️ Clair" : "🌙 Sombre"}
            </button>

            <button className="btn secondary" onClick={() => setSoundsEnabled((s) => !s)}>
              {soundsEnabled ? "🔇 Sons OFF" : "🔊 Sons ON"}
            </button>
          </div>
        </header>

        {/* MAIN LAYOUT (like your picture) */}
        <main className="game-layout">

          {/* LEFT PANEL */}
          <section className="panel left">

            <div className="card">
              <h2>Joueur</h2>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="card">
              <h2>Multiplicateur</h2>
              <button className="btn primary" onClick={acheterMultiplicateur}>
                Acheter Multiplicateur — {100 * multiplicateur}
              </button>
              <p style={{ textAlign: "center", marginTop: 10 }}>
                +{multiplicateur} par clic
              </p>
            </div>

            <div className="card">
              <h2>Prestige</h2>
              <p>Points : {prestigePoints}</p>
              <p>Disponibles : {prestigeDisponible}</p>
              <p>Bonus : +{prestigePoints * 10}%</p>

              <button
                className="btn danger"
                onClick={fairePrestige}
                disabled={prestigeDisponible <= 0}
              >
                Faire Prestige
              </button>
            </div>
            <div className="card leaderboard-card">
              <h2>Classement</h2>
              {leaderboard
                .slice()
                .sort((a, b) => b.bestScore - a.bestScore)
                .slice(0, 10)
                .map((p, i) => (
                  <p key={`${p.username}-${i}`}>
                    #{i + 1} — {p.username} : {Math.floor(p.bestScore)}
                  </p>
                ))}
            </div>

          </section>

          {/* CENTER PANEL */}
          <section className="panel center">

            <div className="card center">
              <ClickButton onClick={handleClick} cookiesParClic={multiplicateur} />

              <p style={{ marginTop: 10, fontSize: 18 }}>
                <b>{Math.floor(cookies)}</b> cookies
              </p>

              <button
                className={`btn bonus-like ${bonusActif ? "bonus-active" : ""}`}
                onClick={activerBonus}
                disabled={bonusActif}
              >
                {bonusActif ? `🎁 Bonus x2 (${bonusTempsRestant}s)` : "🎁 Bonus x2 (30s)"}
              </button>

            </div>

            <div className="card">
              <h2>Stats</h2>
              <Stats cookies={cookies} cps={cps} cpm={cpm} totalClicks={totalClicks} />
            </div>

          </section>

          {/* RIGHT PANEL */}
          <section className="panel right">

            <div className="card">
              <h2>Améliorations</h2>
              <AmeliorationsList
                ameliorations={ameliorations}
                machines={machines}
                onBuy={acheter}
              />
            </div>

            <div className="card">
              <h2>Succès</h2>
              {success.length === 0 && <p>Aucun succès pour l’instant</p>}
              {success.includes("100") && <p>🎉 100 cookies !</p>}
              {success.includes("1000") && <p>🔥 1 000 cookies !</p>}
              {success.includes("10000") && <p>💎 10 000 cookies !</p>}
            </div>





          </section>
        </main>
{/* FULL WIDTH SAVE PANEL */}
<section className="save-full">
  <div className="card save-card">
    <h2>Sauvegarde</h2>

    <div className="save-actions">
      <button className="btn secondary" onClick={exporterSauvegarde}>
        📦 Exporter
      </button>

      <label className="file-input-label">
        Importer
        <input
          type="file"
          accept="application/json"
          onChange={importerSauvegarde}
          className="file-input"
        />
      </label>
    </div>
  </div>
</section>

        {/* TEXTES FLOTTANTS */}
        {floatingTexts.map((t) => (
          <div
            key={t.id}
            className="floating-text"
            style={{ left: t.x, top: t.y }}
          >
            {t.value}
          </div>
        ))}

        {/* POPUP SUCCÈS */}
        {successPopup && <div className="success-popup">{successPopup}</div>}

        {/* PARTICULES NEN */}
        <div className="nen-particles">
          {Array.from({ length: 40 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                animationDelay: Math.random() * 6 + "s",
                animationDuration: 4 + Math.random() * 6 + "s",
              }}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;
