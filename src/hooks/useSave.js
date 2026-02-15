import { useEffect } from "react";

export function useSave(username, data, leaderboard, soundsEnabled) {
  useEffect(() => {
    localStorage.setItem(`cookie-clicker-${username}`, JSON.stringify(data));
  }, [username, data]);

  useEffect(() => {
    localStorage.setItem("cookie-leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem("cookie-sounds", JSON.stringify(soundsEnabled));
  }, [soundsEnabled]);
}
