import js from "@eslint/js";
import nextEslintPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{ ignores: ["dist", ".next", "next-env.d.ts"] },
	nextEslintPlugin.flatConfig.coreWebVitals,
	{
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		plugins: {
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
		},
	},
	{
		files: ["app/layout.tsx"],
		rules: {
			"@next/next/no-page-custom-font": "off",
			"react-refresh/only-export-components": "off",
		},
	},
	{
		files: ["next.config.ts"],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: globals.node,
		},
		extends: [js.configs.recommended, ...tseslint.configs.recommended],
	},
);
