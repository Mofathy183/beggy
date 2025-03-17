const swaggerDefinition = {
	openapi: '3.0.0', // OpenAPI version
	info: {
		title: 'Beggy API', // API Title
		version: '1.0.0', // API Version
		description: 'Beggy API', // API Description
	},
	servers: [
		{
			url: 'http://localhost:3000', // Your API server URL
			description: 'Local Server',
		},
	],
};

const swaggerOptions = {
	swaggerDefinition,
	apis: ['./src/docs/*.yaml'],
};

export default swaggerOptions;
