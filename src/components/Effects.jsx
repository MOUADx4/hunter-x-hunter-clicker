export default function Effects({ game }) {
  return (
    <>
      {game.floatingTexts.map((t) => (
        <div
          key={t.id}
          className="floating-text"
          style={{ left: t.x, top: t.y }}
        >
          {t.value}
        </div>
      ))}

      {game.successPopup && (
        <div className="success-popup">{game.successPopup}</div>
      )}

      <div className="nen-particles">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </>
  );
}
