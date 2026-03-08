import type { SwaggerDefinition, Options } from 'swagger-jsdoc';
import path from 'path';

const swaggerDefinition: SwaggerDefinition = {
	openapi: '3.0.0',
	info: {
		title: 'Beggy API',
		version: '1.0.0',
		description:
			'Beggy is an AI-powered smart travel packing assistant API.',
	},

	servers: [
		{
			url: 'http://localhost:3000/api/beggy',
			description: 'Local development server',
		},
	],

	tags: [
		{ name: 'Auth', description: 'Authentication & identity management' },
		{ name: 'Users', description: 'User management' },
		{ name: 'Profiles', description: 'User profiles' },
		// { name: 'Bags', description: 'Bag management' },
		{ name: 'Items', description: 'Item management' },
		// { name: 'Suitcases', description: 'Suitcase management' },
		// { name: 'Weather', description: 'Weather integration' },
		// { name: 'AI', description: 'Gemini AI recommendations' },
	],

	components: {
		securitySchemes: {
			cookieAuth: {
				type: 'apiKey',
				in: 'cookie',
				name: 'accessToken',
			},

			csrfToken: {
				type: 'apiKey',
				in: 'header',
				name: 'x-csrf-token',
			},
		},
	},

	security: [
		{
			cookieAuth: [],
		},
	],
};

const swaggerOptions: Options = {
	definition: swaggerDefinition,
	apis: [path.join(process.cwd(), '/docs/**/*.yaml')],
};

export default swaggerOptions;
