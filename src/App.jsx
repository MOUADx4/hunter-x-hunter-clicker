import "./style.css";

import { useGame } from "./hooks/useGame";
import Panels from "./components/Panels";
import Effects from "./components/Effects";

export default function App() {
  const game = useGame();

  return (
    <div className="app-root">
      <video autoPlay loop muted className="video-bg">
        <source src="/videos/hxh-bg.mp4" type="video/mp4" />
      </video>

      <div className="app-container">
        <Panels game={game} />
        <Effects game={game} />
      </div>
    </div>
  );
}
