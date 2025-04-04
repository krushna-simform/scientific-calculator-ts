class MemoryStorage {
  private key: string;
  private memoryValue: number;

  constructor(key: string = "memory") {
    this.key = key;
    this.memoryValue = this.loadMemory();
  }

  private loadMemory(): number {
    try {
      const storedValue = localStorage.getItem(this.key);
      return storedValue ? parseFloat(storedValue) : 0;
    } catch (err) {
      return 0;
    }
  }

  // Store a new value in memory
  storeMemory(value: number): void {
    if (Number.isFinite(value)) {
      this.memoryValue = value;
      localStorage.setItem(this.key, this.memoryValue.toString());
    }
  }

  // Recall the stored value
  recallMemory(): number {
    return this.memoryValue;
  }

  // Add a value to the stored memory
  addToMemory(value: number): void {
    if (Number.isFinite(value)) {
      this.memoryValue += value;
      localStorage.setItem(this.key, this.memoryValue.toString());
    }
  }

  // Subtract a value from the stored memory
  subtractFromMemory(value: number): void {
    if (Number.isFinite(value)) {
      this.memoryValue -= value;
      localStorage.setItem(this.key, this.memoryValue.toString());
    }
  }

  // Clear memory storage
  clearMemory(): void {
    this.memoryValue = 0;
    localStorage.removeItem(this.key);
  }
}

export { MemoryStorage };
