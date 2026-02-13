export default function ClickButton({ onClick, cookiesParClic = 1 }) {
  return (
    <div className="click-wrap">
      <button className="main-click" onClick={onClick} aria-label="Click">
        <img src="public/images/nen-symbol.png" alt="Nen Symbol" />
      </button>

      <div className="click-sub">
        <span className="click-plus">+{cookiesParClic} Par Clic</span>
      </div>
    </div>
  );
}
