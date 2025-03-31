import { Expression } from "./expression";
import { History } from "./history";
import { MemoryStorage } from "./calculatorMemoryStorage";

export class Calculator {
  calculatorContainer: HTMLElement;
  inputField: HTMLElement;
  buttons: NodeListOf<HTMLButtonElement>;
  feButton: HTMLButtonElement;
  sinButton: HTMLButtonElement;
  cosButton: HTMLButtonElement;
  tanButton: HTMLButtonElement;

  private currentInput = "0";
  private resultDisplayed = false;
  private isDegreeMode = true;
  private isSecondPrimary = false;
  private feMode = false;

  private expression: Expression;
  private history: History;
  private memory: MemoryStorage;

  constructor(
    calculatorSelector: string,
    inputFieldSelector: string,
    buttonSelectors: string,
    feButtonSelector: string,
    sinButtonSelector: string,
    cosButtonSelector: string,
    tanButtonSelector: string
  ) {
    this.calculatorContainer = document.querySelector(
      calculatorSelector
    ) as HTMLElement;
    this.inputField = document.querySelector(inputFieldSelector) as HTMLElement;
    this.buttons = document.querySelectorAll(
      buttonSelectors
    ) as NodeListOf<HTMLButtonElement>;

    this.feButton = document.querySelector(
      feButtonSelector
    ) as HTMLButtonElement;

    this.sinButton = document.querySelector(
      sinButtonSelector
    ) as HTMLButtonElement;
    this.cosButton = document.querySelector(
      cosButtonSelector
    ) as HTMLButtonElement;
    this.tanButton = document.querySelector(
      tanButtonSelector
    ) as HTMLButtonElement;

    this.expression = new Expression();
    this.history = new History("calculator-history");
    this.memory = new MemoryStorage();

    this.init();
  }

  init(): void {
    this.buttons.forEach((button) => {
      button.addEventListener("click", (e: Event) => this.handleButtonClick(e));
    });

    document.addEventListener("keydown", (e: KeyboardEvent) =>
      this.handleKeyEvent(e)
    );

    (
      document.getElementById("history-logo") as HTMLButtonElement
    ).addEventListener("click", () => this.toggleHistoryPopup());

    (
      document.getElementById("clear-history") as HTMLButtonElement
    ).addEventListener("click", () => {
      this.clearHistory();
    });

    (
      document.getElementById("close-button") as HTMLButtonElement
    ).addEventListener("click", () => {
      this.toggleHistoryPopup();
    });

    this.feButton.addEventListener("click", () => this.toggleFE());

    this.setupPopup("button[value='trigonometry']", "trig-popup");
    this.setupPopup("button[value='functions']", "func-popup");
  }

  clearInputField(): void {
    this.currentInput = "0";
    this.inputField.textContent = this.currentInput;
  }

  removeLastCharacter(): void {
    this.currentInput = this.currentInput.slice(0, -1);
    this.inputField.textContent = this.currentInput;
    if (this.inputField.textContent.trim() === "") {
      this.clearInputField();
    }
  }

  updateInputField(value: string) {
    if (this.currentInput.length >= 25) {
      alert("You can only add up to 25 characters");
      return;
    }

    const lastChar = this.currentInput.slice(-1);
    const operator = ["+", "-", "*", "/", "%", "^"];

    if (operator.includes(value) && operator.includes(lastChar)) {
      return;
    } else if (this.resultDisplayed && /[0-9.]/.test(value)) {
      this.clearInputField();
    } else if (value === "." && lastChar === ".") {
      return;
    }
    // Prevents multiple decimal points in a single number (exp = "12.12.2")
    else if (
      value === "." &&
      this.currentInput
        .split(/[\+\-\*\/]/)
        .pop()
        ?.includes(".")
    ) {
      return;
    }

    this.resultDisplayed = false;
    if (this.inputField.textContent?.trim() === "0") {
      this.currentInput = value;
    } else {
      this.currentInput += value;
    }
    this.inputField.textContent = this.currentInput;
    this.inputField.scrollTo(this.inputField.offsetWidth, 0);
  }

  calculateResult(): void {
    try {
      const result = this.expression.evaluateExpression(
        this.currentInput,
        this.isDegreeMode
      );

      if (this.feMode) {
        const numericResult = result;
        this.displayValue(this.toEngineeringNotation(numericResult));
        this.resultDisplayed = true;
        return;
      }

      this.displayValue(result);
      this.resultDisplayed = true;
    } catch (err) {
      alert(`Invalid Expression ${err}`);
    }
  }

  displayValue(result: number | string) {
    if (typeof result === "number" && isNaN(result)) return;

    if (typeof result === "number") {
      this.history.dataPush(
        {
          question: this.currentInput,
          answer: result.toString(),
        },
        () => {
          this.displayHistory();
        }
      );
    }

    this.currentInput = result.toString();
    this.inputField.textContent = this.currentInput;
  }

  toggleDegRed(button: HTMLButtonElement) {
    const isDeg = this.isDegreeMode;
    button.value = isDeg ? "radian" : "degree";
    button.textContent = isDeg ? "RAD" : "DEG";
    button.ariaLabel = isDeg ? "Radian Mode" : "Degree Mode";
    this.isDegreeMode = !isDeg;
  }

  toggleSecondPrimary(button: HTMLButtonElement) {
    const isSecondMode = this.isSecondPrimary;
    button.value = isSecondMode ? "second-function" : "primary-function";
    button.ariaLabel = isSecondMode ? "Second Functions" : "Primary Functions";
    button.textContent = isSecondMode ? "2nd" : "Primary";

    this.sinButton.value =
      this.sinButton.ariaLabel =
      this.sinButton.textContent =
        isSecondMode ? "sin" : "asin";
    this.cosButton.value =
      this.cosButton.ariaLabel =
      this.cosButton.textContent =
        isSecondMode ? "cos" : "acos";
    this.tanButton.value =
      this.tanButton.ariaLabel =
      this.tanButton.textContent =
        isSecondMode ? "tan" : "atan";

    this.isSecondPrimary = !isSecondMode;
  }

  toggleHistoryPopup(): void {
    const historyPopup = document.getElementById("history-popup");
    if (!historyPopup) return;
    historyPopup.classList.toggle("hidden");
    this.displayHistory();
  }

  displayHistory(): void {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;
    historyList.innerHTML = "";

    const historyData = this.history.getHistory();

    if (historyData.length === 0) {
      historyList.innerHTML = "<li>No history available</li>";
      return;
    }

    historyData.forEach((entry) => {
      const li = document.createElement("li") as HTMLLIElement;
      li.textContent = entry;
      historyList.prepend(li);
    });
  }

  clearHistory(): void {
    this.history.clearHistory();
    this.displayHistory();
  }

  toEngineeringNotation(value: number): string {
    if (value === 0) return "0";

    const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
    const coefficient = value / Math.pow(10, exponent);

    return `${coefficient.toFixed(3)}E${exponent}`;
  }

  toggleFE(): void {
    const isFeMode = this.feMode;
    this.feButton.value = isFeMode ? "f-e" : "ex";
    this.feButton.textContent = isFeMode ? "F-E" : "E";
    this.feButton.ariaLabel = isFeMode
      ? "Default Notation Mode"
      : "Scientific Notation Mode";

    this.feMode = !isFeMode;
  }

  setupPopup(triggerSelector: string, popupId: string) {
    const trigger = document.querySelector(
      triggerSelector
    ) as HTMLButtonElement;
    const popup = document.getElementById(popupId) as HTMLElement;

    trigger.addEventListener("click", (e: MouseEvent) => {
      e.stopPropagation();
      popup.classList.toggle("hidden");
    });

    popup.addEventListener("click", (e: Event) => {
      const button = (e.target as HTMLButtonElement).closest("button");
      if (button) {
        const value = button.getAttribute("value");
        if (value) {
          this.updateInputField(value + "(");
        }
        popup.classList.add("hidden");
      }
    });

    document.addEventListener("click", (e: Event) => {
      if (
        !popup.contains(e.target as HTMLButtonElement) &&
        !trigger.contains(e.target as HTMLButtonElement)
      ) {
        popup.classList.add("hidden");
      }
    });
  }

  handleButtonClick(e: Event): void {
    const button = (e.target as HTMLButtonElement).closest("button");
    if (!button) return;
    const value = button.value;

    const nonPrintValue = ["trigonometry", "functions", "f-e", "ex"];

    if (nonPrintValue.includes(value)) {
      return;
    } else if (value.startsWith("memory")) {
      this.handleMemoryOperations(value);
      return;
    }

    switch (value) {
      case "clear-all":
        this.clearInputField();
        this.resultDisplayed = false;
        break;
      case "backspace":
        this.removeLastCharacter();
        break;
      case "calculate":
        this.calculateResult();
        break;
      case "degree":
      case "radian":
        this.toggleDegRed(button);
        break;
      case "second-function":
      case "primary-function":
        this.toggleSecondPrimary(button);
        break;
      case "plus-minus":
        if (this.currentInput === "0") return;

        if (this.currentInput.startsWith("-")) {
          this.currentInput = this.currentInput.slice(1); // remove (-)
        } else {
          this.currentInput = "-" + this.currentInput; // add (+)
        }

        this.inputField.textContent = this.currentInput;
        break;
      default:
        if (this.resultDisplayed && !/[\+\-\*\/]/.test(value)) {
          this.clearInputField();
        }
        this.updateInputField(value);
    }
  }

  handleMemoryOperations(value: string): void {
    switch (value) {
      case "memory-clear":
        this.memory.clearMemory();
        break;
      case "memory-recall":
        this.updateInputField(this.memory.recallMemory().toString());
        break;
      case "memory-add":
        this.memory.addToMemory(parseFloat(this.currentInput) || 0);
        break;
      case "memory-subtract":
        this.memory.subtractFromMemory(parseFloat(this.currentInput) || 0);
        break;
      case "memory-store":
        this.memory.storeMemory(parseFloat(this.currentInput) || 0);
        break;
    }
  }

  handleKeyEvent(e: KeyboardEvent): void {
    const key = e.key;

    // Remove focus from last clicked button
    if (document.activeElement instanceof HTMLButtonElement) {
      document.activeElement.blur();
    }

    if (key === "Backspace") {
      this.removeLastCharacter();
    } else if (key.toLowerCase() === "c") {
      this.clearInputField();
    } else if (key === "Enter") {
      this.calculateResult();
    } else if (key === "E") {
      this.updateInputField("e");
    } else if (/[0-9.()\+\-\*\/^\!e\%]/.test(key)) {
      this.updateInputField(key.toLowerCase());
    }
  }
}
