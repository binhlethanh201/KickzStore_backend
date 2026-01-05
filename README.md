# 👟 KickzStore

**KickzStore** is a modern full-stack e-commerce application specializing in footwear retail.  
This repository contains the **backend REST API** that powers the KickzStore client.  
Built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)**, it provides secure user authentication, product catalog management, cart and wishlist handling, order processing, and admin management capabilities.


## Prerequisites

- Node.js (version 16 or higher) and npm installed on your system
- A running MongoDB instance (local or cloud, e.g., MongoDB Atlas)
- (Optional) API testing tool like Postman, Insomnia, or Hoppscotch
- (Optional) A code editor like VS Code, Sublime Text, or Atom for easier code navigation
- Basic understanding of JavaScript and Node.js
- Knowledge of REST APIs and HTTP methods


## Installation

1. **Clone the repository** (if not already downloaded):

   ```sh
   git clone <repository-url>
   cd KickzStore_backend
   ```

2. **Install backend dependencies**:

   ```sh
   npm install
   ```

3. **Configure environment variables**:

   Create a `.env` file in the project root with values suitable for your environment, for example:

   ```sh
   MONGODB_URI=mongodb://localhost:27017/kickzstore
   JWT_SECRET=your_jwt_secret_here
   PORT=9999
   ```


## How to Run

1. **Start the backend server**:

   ```sh
   node server.js
   ```

   The API will start on the port defined in your `.env` file (e.g., `http://localhost:5000`).

2. **(Optional) Use nodemon for development**:

   If you prefer automatic restarts on file changes, install nodemon globally or as a dev dependency and run:

   ```sh
   npx nodemon server.js
   ```

3. **Connect the mobile client**:

   Point your KickzStore mobile app (or any frontend client) to the backend base URL, for example:

   ```text
   http://<your-local-ip>:5000
   ```


## Technologies

### Backend

- **Node.js**
- **Express.js 5.1.0**
- **MongoDB with Mongoose 8.19.1**
- **CORS 2.8.5**
- **bcrypt 6.0.0**
- **dotenv 17.2.3**
- **JSON Web Tokens (JWT) for authentication**

### Development Tools

- **npm** as the package manager
- **Git** for version control
- (Optional) **nodemon** for local development


## Troubleshooting

- **Database Connection**:  
  Ensure `MONGODB_URI` in `.env` is correct and your MongoDB instance is running and accessible.

- **Port Conflicts**:  
  If the configured `PORT` is already in use, change it in your `.env` file.

- **CORS Issues**:  
  Verify allowed origins in the CORS configuration if your frontend cannot access the API.

- **Authentication Errors**:  
  Confirm `JWT_SECRET` is set correctly and tokens are sent in the `Authorization: Bearer <token>` header.

- **Environment Variables Not Loaded**:  
  Make sure the `.env` file exists in the project root and that `dotenv` is required and configured early in the app.

- **Dependency Problems**:  
  Delete `node_modules` and `package-lock.json`, then run `npm install` again.


## Contributing

This is a learning project designed for educational purposes. Feel free to:

- Modify endpoints to experiment with different API designs
- Add new features and business logic
- Improve documentation and inline comments
- Share your learning experiences
- Report bugs and suggest improvements


## Learn More

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JSON Web Tokens Documentation](https://jwt.io/introduction)


For questions or contributions, please open an issue or pull request on the GitHub repository.


## License

This project is licensed under the ISC License - see the LICENSE file for details.


