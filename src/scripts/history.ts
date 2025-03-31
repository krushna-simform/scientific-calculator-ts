interface HistoryEntry {
  question: string;
  answer: string;
}

class History {
  private history: { question: string; answer: string }[];
  private key: string;

  constructor(key: string) {
    this.history = [];
    this.key = key;

    this.appendHistory();
  }

  private appendHistory(): void {
    try {
      const storedHistory: HistoryEntry[] = JSON.parse(
        localStorage.getItem(this.key) || "[]"
      );
      if (Array.isArray(storedHistory)) {
        this.history.push(...storedHistory);
      }
    } catch (err) {
      this.history = [];
    }
  }

  dataPush(data: HistoryEntry, cb: () => void = () => {}): void {
    if (!Number.isNaN(data)) {
      this.history.push(data);
      this.historySave();
    }
    cb();
  }

  private historySave(): void {
    localStorage.setItem(this.key, JSON.stringify(this.history));
  }

  getHistory(): string[] {
    return this.history.map((entry) => `${entry.question} = ${entry.answer}`);
  }

  clearHistory(): void {
    localStorage.removeItem(this.key);
    this.history = [];
  }
}

export { History };
