export default function AmeliorationsList({ ameliorations = [], machines = [], onBuy }) {
  const list = [
    ...ameliorations.map((a) => ({ ...a, type: "amelioration" })),
    ...machines.map((m) => ({ ...m, type: "machine" })),
  ];

  return (
    <div className="shop-list">
      {list.map((item) => (
        <div key={`${item.type}-${item.id}`} className="shop-row">
          <div className="shop-left">
            <div className="shop-name">{item.nom}</div>
            <div className="shop-cost">— {item.coutActuel}</div>
          </div>

          <button
            className="btn buy-btn"
            onClick={() => onBuy(item.id, item.type)}
          >
            Acheter
          </button>
        </div>
      ))}
    </div>
  );
}
