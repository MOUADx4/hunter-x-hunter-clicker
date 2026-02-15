import { useRef, useEffect } from "react";

export function useSounds(enabled) {
  const clickSound = useRef(null);
  const buySound = useRef(null);
  const successSound = useRef(null);

  useEffect(() => {
    clickSound.current = new Audio("/sounds/click.mp3");
    buySound.current = new Audio("/sounds/buy.mp3");
    successSound.current = new Audio("/sounds/success.mp3");
  }, []);

  const play = (ref) => {
    if (!enabled) return;
    if (!ref.current) return;
    ref.current.currentTime = 0;
    ref.current.play().catch(() => {});
  };

  return {
    playClick: () => play(clickSound),
    playBuy: () => play(buySound),
    playSuccess: () => play(successSound),
  };
}
