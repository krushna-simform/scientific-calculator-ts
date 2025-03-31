interface ExtendedMath extends Math {
  sindeg: (x: number) => number;
  cosdeg: (x: number) => number;
  tandeg: (x: number) => number;
  asindeg: (x: number) => number;
  acosdeg: (x: number) => number;
  atandeg: (x: number) => number;
}

class Expression {
  private math: ExtendedMath;

  constructor() {
    this.math = Math as ExtendedMath;

    // Define trigonometric functions in degrees
    this.math.sindeg = (x: number) => Math.sin((Math.PI / 180) * x);
    this.math.cosdeg = (x: number) => Math.cos((Math.PI / 180) * x);
    this.math.tandeg = (x: number) => Math.tan((Math.PI / 180) * x);

    this.math.asindeg = (x: number) => (180 / Math.PI) * Math.asin(x);
    this.math.acosdeg = (x: number) => (180 / Math.PI) * Math.acos(x);
    this.math.atandeg = (x: number) => (180 / Math.PI) * Math.atan(x);
  }

  evaluateExpression(expression: string, degreeMode: boolean = false): number {
    function factorial(n: number): number {
      if (n === 0 || n === 1) return 1;
      return n * factorial(n - 1);
    }

    try {
      // Remove 0 value exp: 03 => 3
      expression = expression.replace(/\b0+(\d+)/g, "$1");

      // Replace π with Math.PI
      expression = expression.replace(/π/g, "this.math.PI");

      // Replace "e" (Euler's number) with Math.E
      expression = expression.replace(/\be\b/g, "this.math.E");

      // Replace "^"
      expression = expression.replace(/\^/g, "**");

      // Replace factorial notation
      expression = expression.replace(/(\d+)!/g, "factorial($1)");

      // Trigonometric functions conversion
      if (degreeMode) {
        expression = expression.replace(/\bsin\(/g, "this.math.sindeg(");
        expression = expression.replace(/\bcos\(/g, "this.math.cosdeg(");
        expression = expression.replace(/\btan\(/g, "this.math.tandeg(");
        expression = expression.replace(/\basin\(/g, "this.math.asindeg(");
        expression = expression.replace(/\bacos\(/g, "this.math.acosdeg(");
        expression = expression.replace(/\batan\(/g, "this.math.atandeg(");
      } else {
        expression = expression.replace(/\bsin\(/g, "this.math.sin(");
        expression = expression.replace(/\bcos\(/g, "this.math.cos(");
        expression = expression.replace(/\btan\(/g, "this.math.tan(");
        expression = expression.replace(/\basin\(/g, "this.math.asin(");
        expression = expression.replace(/\bacos\(/g, "this.math.acos(");
        expression = expression.replace(/\batan\(/g, "this.math.atan(");
      }

      // Handle other math functions
      expression = expression.replace(/\babs\(/g, "this.math.abs(");
      expression = expression.replace(/\bexp\(/g, "this.math.exp(");
      expression = expression.replace(/\bsqrt\(/g, "this.math.sqrt(");
      expression = expression.replace(/\blog\(/g, "this.math.log10(");
      expression = expression.replace(/\bln\b/g, "this.math.log");
      expression = expression.replace(/\bfloor\(/g, "this.math.floor(");
      expression = expression.replace(/\bceil\(/g, "this.math.ceil(");
      expression = expression.replace(/\bround\(/g, "this.math.round(");

      const result = eval(expression);

      if (result === Infinity) {
        throw new Error("Infinity | Invalid expression");
      } else {
        return result;
      }
    } catch (err) {
      throw new Error("Invalid Expression");
    }
  }
}

export { Expression };
