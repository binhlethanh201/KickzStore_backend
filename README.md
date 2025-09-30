## Node.js Express Framework Learning Project — KickzStore Backend

This repository contains a focused Node.js Express backend for KickzStore. It demonstrates server-side JavaScript with Express.js, MongoDB integration via Mongoose, modular routing, and clean controller/model organization. It serves as a learning-friendly codebase for building RESTful APIs with Node.js and Express.

### Prerequisites

- Node.js (version 14 or higher) and npm installed on your system
- MongoDB installed and running locally (or MongoDB Atlas account)
- (Optional) A code editor like VS Code for easier code navigation
- Basic understanding of JavaScript, HTTP, and REST APIs

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd kickzstore_backend
```

2. Install dependencies:
```sh
npm install
```

3. Set up MongoDB and environment variables:
Create a `.env` file in the project root with:
```env
MONGO_URI=mongodb://localhost:27017
DBNAME=kickzstore_dev
# Optional: override default 9999
PORT=9999
```

### How to Run

#### Development Mode

Start the application (uses nodemon):
```sh
npm start
```
The server starts at `http://localhost:9999` by default (or `http://localhost:$PORT` if `PORT` is set). All routes are mounted under `/api`.

#### Production Mode

Run the server without nodemon:
```sh
node server.js
```

### Project Structure

```
kickzstore_backend/
├── config/
│   └── db.js
├── controllers/
├── models/
├── routes/
├── server.js
├── package.json
└── README.md
```

- `config/db.js`: MongoDB connection setup using `MONGO_URI` and `DBNAME`
- `server.js`: Express app initialization, middleware, route mounting at `/api`, and server start
- `controllers/`: Request handling and business logic per resource
- `models/`: Mongoose schemas and models
- `routes/`: Express routers for each resource, composed in `routes/index.js`

### Features

- **Express.js Framework**: Modern Node.js web application framework
- **Modular Architecture**: Clear separation of routes, controllers, and models
- **MongoDB Integration**: NoSQL database with Mongoose ODM
- **CRUD Ready**: Controllers and routes scaffolded for typical CRUD operations
- **RESTful API Design**: Proper HTTP method usage and route structure
- **Environment Config**: `.env` driven configuration (URI, DB name, port)
- **Development Tools**: Nodemon for automatic server restart
- **Logging**: Morgan dependency available for HTTP request logging
- **CORS/JSON**: JSON parsing and CORS support for API consumption

### Technologies Used

- **Node.js**
- **Express.js 5.1.0**
- **MongoDB**
- **Mongoose 8.x**
- **Morgan 1.10.x**
- **Body-Parser 2.x**
- **CORS 2.8.x**
- **Dotenv 17.x**
- **Nodemon 3.x**

### API Endpoints

All endpoints are prefixed with `/api`.

- **Carts**
  - `GET /api/carts` — List all carts
- **Products**
  - `GET /api/products` — List all products
- **Users**
  - `GET /api/users` — List all users
- **Wishlists**
  - `GET /api/wishlists` — List all wishlist entries

Extend controllers and routes to add POST/PUT/PATCH/DELETE as needed.

### Development Workflow

1. Ensure MongoDB is running and `.env` variables are set
2. Start dev server with `npm start`
3. Use an API client (Postman/Insomnia) to test endpoints at `http://localhost:9999/api/...`

### Troubleshooting

- **Database Connection**: Verify `MONGO_URI` and `DBNAME` in `.env`, ensure MongoDB is running
- **Port Conflicts**: Set a different `PORT` in `.env`
- **Dependencies**: Run `npm install` if modules are missing
- **CORS**: Configure `cors` if calling from a different origin
- **Console Errors**: Check terminal output for stack traces and connection logs

### Contributing

This is a learning project. Feel free to:
- Add new endpoints and business logic
- Improve validations and error handling
- Enhance documentation
- Open issues and pull requests

### Learn More

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Node.js Documentation](https://nodejs.org/en/docs/)

### License

This project is licensed under the ISC License — see the LICENSE file for details.
