import { useState } from 'react';
import { Action } from '../types';

export const useHistory = () => {
  const [history, setHistory] = useState<Action[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addAction = (action: Action) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, action]);
    setHistoryIndex(newHistory.length);
  };

  return { history, historyIndex, addAction, setHistory, setHistoryIndex };
};