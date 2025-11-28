import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./public/**/*.html",
		"./src/**/*.ts"
	],
	theme: {
		extend: {
			colors: {
				brand: {
					primary: "#0f172a",
					secondary: "#38bdf8",
					accent: "#f472b6"
				}
			}
		}
	},
	plugins: []
};

export default config;

