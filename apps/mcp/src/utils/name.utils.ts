export interface ModuleNames {
	folder: string;
	pascal: string;
	camel: string;
	upper: string;
}

export function resolveNames(input: string): ModuleNames {
	const folder = input.toLowerCase().trim();
	const parts = folder.split('-');

	const pascal = parts
		.map((part) => {
			const singular = part.endsWith('s') ? part.slice(0, -1) : part;
			return singular.charAt(0).toUpperCase() + singular.slice(1);
		})
		.join('');

	const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
	const upper = folder.replace(/-/g, '_').toUpperCase();

	return { folder, pascal, camel, upper };
}

export function validateModuleName(name: string): void {
	if (!/^[a-z][a-z0-9-]*$/.test(name)) {
		throw new Error(
			`Invalid module name: "${name}".\n` +
				`Use lowercase letters, numbers, and hyphens only.\n` +
				`Examples: "trips", "bags", "bag-items"`
		);
	}
}
