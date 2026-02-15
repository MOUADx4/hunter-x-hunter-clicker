import ClickButton from "./ClickButton";
import Stats from "./Stats";
import AmeliorationsList from "./AmeliorationsList";

export default function Panels({ game }) {
  return (
    <>
      {/* HEADER */}
      <header className="app-header">
        <img
          src="/images/hxh-logo.png"
          alt="Hunter x Hunter Logo"
          className="hxh-logo"
        />

        <div className="header-actions">
          <button
            className="btn secondary"
            onClick={() => game.setDarkMode((d) => !d)}
          >
            {game.darkMode ? "☀️ Clair" : "🌙 Sombre"}
          </button>

          <button
            className="btn secondary"
            onClick={() => game.setSoundsEnabled((s) => !s)}
          >
            {game.soundsEnabled ? "🔇 Sons OFF" : "🔊 Sons ON"}
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <main className="game-layout">
        {/* LEFT */}
        <section className="panel left">
          <div className="card">
            <h2>Joueur</h2>
            <input
              className="input"
              value={game.username}
              onChange={(e) => game.setUsername(e.target.value)}
            />
          </div>

          <div className="card">
            <h2>Multiplicateur</h2>
            <button className="btn" onClick={game.acheterMultiplicateur}>
              Acheter Multiplicateur — {100 * game.multiplicateur}
            </button>
          </div>

          <div className="card">
            <h2>Prestige</h2>
            <p>Points : {game.prestigePoints}</p>
            <p>Disponibles : {game.prestigeDisponible}</p>

            <button
              className="btn danger"
              onClick={game.fairePrestige}
              disabled={game.prestigeDisponible <= 0}
            >
              Faire Prestige
            </button>
          </div>

          {/* CLASSEMENT */}
          <div className="card leaderboard-card">
            <h2>Classement</h2>

            {game.leaderboard
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

        {/* CENTER */}
        <section className="panel center">
          <div className="card center">
            <ClickButton
              onClick={game.handleClick}
              cookiesParClic={game.multiplicateur}
            />

            <p style={{ marginTop: 10, fontSize: 18 }}>
              <b>{Math.floor(game.cookies)}</b> cookies
            </p>

            <button
              className={`btn bonus-like ${
                game.bonusActif ? "bonus-active" : ""
              }`}
              onClick={game.activerBonus}
              disabled={game.bonusActif}
            >
              {game.bonusActif
                ? `🎁 Bonus x2 (${game.bonusTempsRestant}s)`
                : "🎁 Bonus x2 (30s)"}
            </button>
          </div>

          <div className="card">
            <Stats cookies={game.cookies} cps={game.cps} />
          </div>
        </section>

        {/* RIGHT */}
        <section className="panel right">
          <div className="card">
            <h2>Améliorations</h2>

            <AmeliorationsList
              ameliorations={game.ameliorations}
              machines={game.machines}
              onBuy={game.acheter}
            />
          </div>

          <div className="card">
            <h2>Succès</h2>

            {game.success.length === 0 && <p>Aucun succès</p>}
            {game.success.includes("100") && <p>🎉 100 cookies !</p>}
            {game.success.includes("1000") && <p>🔥 1 000 cookies !</p>}
            {game.success.includes("10000") && <p>💎 10 000 cookies !</p>}
          </div>
        </section>
      </main>

      {/* SAVE PANEL */}
      <section className="save-full">
        <div className="card save-card">
          <h2>Sauvegarde</h2>

          <div className="save-actions">
            <button
              className="btn secondary"
              onClick={game.exporterSauvegarde}
            >
              📦 Exporter
            </button>

            <label className="file-input-label">
              Importer
              <input
                type="file"
                accept="application/json"
                onChange={game.importerSauvegarde}
                className="file-input"
              />
            </label>
          </div>
        </div>
      </section>
    </>
  );
}
