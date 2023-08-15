# Web Scrapping Using Puppeteer

In this project, express generator boilerplate for building RESTful APIs using Express.js is used for basic structure. It includes modern features such as ES2017 async/await, CORS support, helmet for enhanced security, environment variable management with dotenv, request validation with joi, linting with eslint, git hooks with husky, logging with morgan, and API documentation generation with apidoc. Additionally, it integrates Puppeteer for web scraping capabilities.

## Install dependencies:

```bash
npm install
```

Rename .env.example to .env and configure your environment variables.

## Run the development server:

```bash
npm start
```
## Features
- ES2017 latest features like Async/Await for clean and efficient asynchronous code.
- CORS enabled to handle cross-origin requests securely.
- Express.js for building the API framework (http://expressjs.com/).
- Helmet to set HTTP headers for enhanced security (https://github.com/helmetjs/helmet).
- Environment variable management using dotenv (https://github.com/rolodato/dotenv-safe).
- Request validation with joi (https://github.com/hapijs/joi) for ensuring valid data input.
- Linting using eslint (http://eslint.org) to maintain code quality and consistency.
- Git hooks with husky (https://github.com/typicode/husky) to enforce pre-commit and pre-push actions.
- Logging with morgan (https://github.com/expressjs/morgan) for detailed request/response logging.
- API documentation generation using apidoc (http://apidocjs.com) for clear API reference.
- Puppeteer integration for web scraping capabilities.

## API Documentation
The API documentation is generated using apidoc. To generate/update the documentation, run:

```bash
npm run apidoc
```

The documentation will be generated in the apidoc directory.

## Output
The output of the we scrapping will be stored inside features/scrapper with product id as a folder name, inside that images will be stored for specific product and info.txt having the product details
