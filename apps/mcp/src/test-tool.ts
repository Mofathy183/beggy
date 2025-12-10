#!/usr/bin/env node

/**
 * Test script to directly test the convertApiToTypeScript tool
 * Usage: tsx src/test-tool.ts <filePath> [--no-backup] [--overwrite]
 */

import { convertApiToTypeScript } from './tools/convertApiToTypeScript.js';

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error(
			'Usage: tsx src/test-tool.ts <filePath> [--no-backup] [--overwrite]'
		);
		console.error('');
		console.error('Examples:');
		console.error(
			'  tsx src/test-tool.ts apps/api/src/controllers/authController.js'
		);
		console.error(
			'  tsx src/test-tool.ts apps/api/src/controllers --overwrite'
		);
		console.error(
			'  tsx src/test-tool.ts apps/api/src/config/env.js --no-backup'
		);
		process.exit(1);
	}

	const filePath = args[0];
	const backup = !args.includes('--no-backup');
	const overwrite = args.includes('--overwrite');

	console.log('🔄 Converting JavaScript to TypeScript...');
	console.log(`📁 File/Directory: ${filePath}`);
	console.log(`💾 Backup: ${backup ? 'Yes' : 'No'}`);
	console.log(`✏️  Overwrite: ${overwrite ? 'Yes' : 'No'}`);
	console.log('');

	try {
		const result = await convertApiToTypeScript({
			filePath,
			backup,
			overwrite,
		});

		console.log('');
		if (result.success) {
			console.log('✅ Success!');
			console.log(`📝 ${result.message}`);
			if (result.convertedFiles && result.convertedFiles.length > 0) {
				console.log('');
				console.log('Converted files:');
				result.convertedFiles.forEach((file) => {
					console.log(`  ✓ ${file}`);
				});
			}
		} else {
			console.log('❌ Failed!');
			console.log(`📝 ${result.message}`);
			if (result.errors && result.errors.length > 0) {
				console.log('');
				console.log('Errors:');
				result.errors.forEach((error) => {
					console.log(`  ✗ ${error}`);
				});
			}
		}
	} catch (error) {
		console.error('');
		console.error(
			'❌ Error:',
			error instanceof Error ? error.message : String(error)
		);
		process.exit(1);
	}
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
