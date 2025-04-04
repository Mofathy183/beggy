# Beggy Backend

Welcome to the **Beggy Backend**, the API powering Beggy, a web application that helps users organize items in their suitcases and bags efficiently.

## Table of Contents

- [Beggy Backend](#beggy-backend)
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
- **Express.js** - Web framework for building APIs.
- **Prisma** - ORM for database interactions.
- **PostgreSQL** - Database used for storage.
- **Jest & Supertest** - For API testing.
- **Swagger** - API documentation.
- **Passport.js** - OAuth authentication (Google, Facebook, Instagram).
- **Axios** - For external API requests.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (Latest LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (or a compatible database)

### Installation

1. **Clone the repository:**

    ```sh
    git clone https://github.com/Mofathy183/Beggy-backend.git
    cd Beggy-backend
    ```

2. **Install dependencies:**

    ```sh
    npm install
    ```

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
npx prisma generate
npx prisma migrate deploy
```

### Running the Application

Start the development server:

```sh
npm run dev
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
npm test
```

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
