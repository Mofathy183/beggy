import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import swaggerOptions from './swagger.config';

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Output as JSON
fs.writeFileSync(
	path.join(process.cwd(), 'swagger.json'),
	JSON.stringify(swaggerSpec, null, 2),
	'utf-8'
);

console.warn('✅ swagger.json generated successfully');
