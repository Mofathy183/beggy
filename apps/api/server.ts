import app from './app';
import { serverConfig } from './src/config/env.js';

// Application Listen
app.listen(serverConfig.port, () => {
	console.log(`Server is running on port ${serverConfig.port}`);
	console.log(`http://localhost:${serverConfig.port}`);
});
