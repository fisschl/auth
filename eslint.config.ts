import withNuxt from "./.nuxt/eslint.config.mjs";
import prettier from "eslint-plugin-prettier/recommended";
import oxlint from "eslint-plugin-oxlint";

export default withNuxt(...oxlint.configs["flat/recommended"], prettier, {
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
});
