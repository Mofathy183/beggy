# Beggy

Welcome to the **Beggy**, the API powering Beggy, a web application that helps users organize items in their suitcases and bags efficiently.

## Table of Contents

- [Beggy](#beggy)
    - [Table of Contents](#table-of-contents)
    - [Features](#features)
    - [Technologies Used](#technologies-used)
    - [Getting Started](#getting-started)
        - [Prerequisites](#prerequisites)
        - [Installation](#installation)
        - [Configuration](#configuration)
        - [Prisma Setup](#prisma-setup)
        - [Running the Application](#running-the-application)
    - [API Documentation](#api-documentation)
    - [Testing](#testing)
    - [Contributing](#contributing)
    - [License](#license)

## Features

- **User Authentication**: Secure user registration, login, and role-based access control.
- **Item Management**: Create, update, delete, and retrieve stored items.
- **Bag & Suitcase Management**: Manage suitcases and bags efficiently.
- **Auto-Filling Features**: Uses AI-based auto-filling for volume and weight estimation.
- **Weather Integration**: Fetches weather data based on user location.

## Technologies Used

- **Node.js** - JavaScript runtime environment.
- **TypeScript** - Typed superset of JavaScript for better development experience.
- **Express.js** - Web framework for building APIs.
- **Prisma** - ORM for database interactions.
- **PostgreSQL** - Database used for storage.
- **SWC** - Fast TypeScript/JavaScript compiler for production builds.
- **tsx** - TypeScript execution engine for development with watch mode.
- **Jest & Supertest** - For API testing.
- **Swagger** - API documentation.
- **Passport.js** - OAuth authentication (Google, Facebook, Instagram).
- **Axios** - For external API requests.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended, Node 18+)
- [pnpm](https://pnpm.io/) (recommended) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or a compatible database)
- [TypeScript](https://www.typescriptlang.org/) (installed as dev dependency)

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/Mofathy183/Beggy-backend.git
    cd Beggy-backend
    ```

2. **Install dependencies:**

    ```sh
    pnpm install
    ```

    This will install all dependencies including TypeScript, SWC, and tsx for development.

### Configuration

Since `.env` files are not uploaded to GitHub, create a `.env` file manually in the root directory and add the following:

```sh
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
WEATHER_API_KEY=your_openweather_api_key
```

Replace placeholders with actual values.

### Prisma Setup

Generate Prisma client and apply migrations:

```sh
pnpm prisma:generate
pnpm prisma:migrate
```

Or use npx directly:

```sh
npx prisma generate
npx prisma migrate deploy
```

### Running the Application

**Development Mode** (with hot reload using tsx):

```sh
pnpm dev
```

This uses `tsx watch` to automatically restart the server when files change.

**Production Build** (compile TypeScript to JavaScript using SWC):

```sh
# Build the project
pnpm build

# Start the production server
pnpm start
```

**Type Checking** (without building):

```sh
pnpm type-check
```

By default, the server runs on `http://localhost:3000`.

## API Documentation

Swagger API documentation is available at:

```url
http://localhost:3000/api-docs
```

## Testing

Run unit and integration tests using Jest and Supertest:

```sh
pnpm test
```

## Development Scripts

- `pnpm dev` - Start development server with hot reload (tsx watch)
- `pnpm build` - Build TypeScript to JavaScript using SWC
- `pnpm start` - Start production server (requires build first)
- `pnpm type-check` - Run TypeScript type checking without building
- `pnpm test` - Run tests with Jest
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm format` - Format code with Prettier

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.

2. Create a new branch:

    ```sh
    git checkout -b feature-branch
    ```

3. Commit your changes:

    ```sh
    git commit -m "Add new feature"
    ```

4. Push to your branch:

    ```sh
    git push origin feature-branch
    ```

5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
