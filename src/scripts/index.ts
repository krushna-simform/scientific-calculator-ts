import { Calculator } from "./calculator";

new Calculator(
  ".calculator",
  ".input-field-text",
  ".memory-functions button, .deg-functions button, .trigonometry-functions button, .numeric-operator-buttons button",
  "button[value='f-e']",
  "button[value='sin']",
  "button[value='cos']",
  "button[value='tan']"
);
