import { TokenPriceCalculatorService } from "../services/tokenPrice.service";

function runValidation() {
  const calculator = new TokenPriceCalculatorService("usd", 5);
  const model = "gpt-4o-mini";
  const inputTokens = 16;
  const outputTokens = 714;

  const result = calculator.calculate({ model, inputTokens, outputTokens });

  const expected = {
    inputCost: 0.000012,
    outputCost: 0.002142,
    totalCost: 0.002154,
  };

  const matches =
    result.inputCost === expected.inputCost &&
    result.outputCost === expected.outputCost &&
    result.totalCost === expected.totalCost;

  console.log(
    JSON.stringify(
      {
        model,
        usage_metadata: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
        },
        pricing: {
          inputPerMillion: result.inputRatePerMillion,
          outputPerMillion: result.outputRatePerMillion,
          multiplier: calculator.getPriceMultiplier(),
          currency: result.currency,
        },
        computed: {
          inputCost: result.inputCost,
          outputCost: result.outputCost,
          totalCost: result.totalCost,
        },
        expected,
        matches,
      },
      null,
      2
    )
  );

  if (!matches) {
    console.error(
      "Validation failed: computed costs do not match expected values."
    );
    process.exitCode = 1;
  }
}

runValidation();
