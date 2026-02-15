import { useState, useEffect } from "react";
import { MACHINES } from "../data/machines";
import { useSounds } from "./useSounds";
import { useSave } from "./useSave";

export function useGame() {
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

  const [floatingTexts, setFloatingTexts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [bonusActif, setBonusActif] = useState(false);
  const [bonusTempsRestant, setBonusTempsRestant] = useState(0);
  const bonusMultiplicateur = bonusActif ? 2 : 1;

  const [successPopup, setSuccessPopup] = useState(null);

  const { playClick, playBuy, playSuccess } = useSounds(soundsEnabled);

  const prestigeDisponible = Math.floor(cookies / 1_000_000);

  const bonusPrestige = 1 + prestigePoints * 0.1;
  const totalBonus = bonusPrestige * bonusMultiplicateur;

  const cps = productionAuto * multiplicateur * totalBonus;
  const cpm = cps * 60;

  /* ---------------- LOAD SAVE ---------------- */
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

  /* ---------------- DARK MODE ---------------- */
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");

    localStorage.setItem("cookie-darkmode", JSON.stringify(darkMode));
  }, [darkMode]);

  /* ---------------- BONUS TIMER ---------------- */
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

  /* ---------------- AUTO PRODUCTION ---------------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setCookies((prev) => prev + productionAuto * totalBonus);
    }, 1000);

    return () => clearInterval(interval);
  }, [productionAuto, totalBonus]);

  /* ---------------- CLICK ---------------- */
  const handleClick = (e) => {
    playClick();

    const gain = multiplicateur * bonusMultiplicateur;

    setCookies((c) => c + gain);
    setTotalClicks((t) => t + 1);

    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;

    const id = Math.random();

    setFloatingTexts((prev) => [
      ...prev,
      { id, x, y, value: `+${gain}` },
    ]);

    setTimeout(() => {
      setFloatingTexts((prev) => prev.filter((t) => t.id !== id));
    }, 1000);
  };

  /* ---------------- BUY ---------------- */
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

    if (ok) playBuy();
  };

  const acheterMultiplicateur = () => {
    const cout = 100 * multiplicateur;
    if (cookies < cout) return;

    playBuy();
    setCookies((c) => c - cout);
    setMultiplicateur((m) => m + 1);
  };

  /* ---------------- PRESTIGE ---------------- */
  const fairePrestige = () => {
    if (prestigeDisponible <= 0) return;

    playSuccess();

    setPrestigePoints((p) => p + prestigeDisponible);
    setCookies(0);
    setProductionAuto(0);
    setMultiplicateur(1);
    setAmeliorations([]);
    setMachines(MACHINES);
    setTotalClicks(0);
  };

  /* ---------------- SUCCESS POPUP ---------------- */
  useEffect(() => {
    const newSuccess = [];

    if (cookies >= 100 && !success.includes("100")) newSuccess.push("100");
    if (cookies >= 1000 && !success.includes("1000")) newSuccess.push("1000");
    if (cookies >= 10000 && !success.includes("10000"))
      newSuccess.push("10000");

    if (newSuccess.length > 0) {
      playSuccess();

      setSuccess((prev) => [...prev, ...newSuccess]);

      const labels = {
        100: "🎉 100 cookies !",
        1000: "🔥 1 000 cookies !",
        10000: "💎 10 000 cookies !",
      };

      setSuccessPopup(labels[newSuccess[newSuccess.length - 1]]);
      setTimeout(() => setSuccessPopup(null), 3000);
    }
  }, [cookies, success]);

  /* ---------------- LEADERBOARD ---------------- */
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

  /* ---------------- EXPORT ---------------- */
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

  /* ---------------- IMPORT ---------------- */
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

  /* ---------------- AUTO SAVE ---------------- */
  useSave(
    username,
    {
      cookies,
      productionAuto,
      multiplicateur,
      ameliorations,
      machines,
      totalClicks,
      success,
      prestigePoints,
    },
    leaderboard,
    soundsEnabled
  );

  return {
    username,
    setUsername,

    cookies,
    multiplicateur,
    totalClicks,

    machines,
    ameliorations,

    success,
    leaderboard,

    prestigePoints,
    prestigeDisponible,

    darkMode,
    soundsEnabled,

    bonusActif,
    bonusTempsRestant,

    floatingTexts,
    successPopup,

    cps,
    cpm,

    setDarkMode,
    setSoundsEnabled,

    handleClick,
    acheter,
    acheterMultiplicateur,
    fairePrestige,
    activerBonus,

    exporterSauvegarde,
    importerSauvegarde,
  };
}
