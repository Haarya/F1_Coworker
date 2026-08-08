import { useEffect } from 'react';
import { useRaceSession } from '../context/RaceSessionContext';

export function usePlayback() {
  const { state, dispatch } = useRaceSession();

  useEffect(() => {
    let intervalId: number;

    if (state.playbackState === 'playing') {
      // Tick every 100ms
      const tickRateMs = 100;
      intervalId = window.setInterval(() => {
        // Increment timestamp based on playback speed
        // 100ms * speed = elapsed session time in seconds (e.g. 100ms * 1x = 0.1s)
        const timeIncrement = (tickRateMs / 1000) * state.playbackSpeed;
        dispatch({ type: 'TICK_PLAYBACK', payload: timeIncrement });
      }, tickRateMs);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [state.playbackState, state.playbackSpeed, dispatch]);
}
