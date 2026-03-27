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
		{
			name: 'Auth',
			description:
				'Authentication & identity management including login, registration, and session handling',
		},
		{
			name: 'Users',
			description:
				'User account management including retrieval, updates, and administrative operations',
		},
		{
			name: 'Profiles',
			description:
				'User profile management including personal details and onboarding state',
		},
		{
			name: 'Bags',
			description:
				'Bag management including creation, organization, and capacity tracking',
		},
		{
			name: 'Items',
			description:
				'Item management including CRUD operations, categorization, and inventory tracking',
		},
		{
			name: 'Dashboard',
			description:
				'Aggregated dashboard overview combining profile state, item insights, and recent activity',
		},
		// {
		//   name: 'Suitcases',
		//   description:
		//     'Suitcase management including packing configurations and travel preparation',
		// },
		// {
		//   name: 'Weather',
		//   description:
		//     'Weather integration for travel context and environmental insights',
		// },
		// {
		//   name: 'AI',
		//   description:
		//     'AI-powered recommendations for packing and travel optimization',
		// },
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
