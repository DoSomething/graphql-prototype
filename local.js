// Compile ES module syntax on-demand, install 'fetch'
// polyfill, & load environment variables from '.env'.
require('dotenv').config();
fetch = require('node-fetch');
require = require('esm')(module);

const chalk = require('chalk');
const boxen = require('boxen');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const config = require('./config').default;
const schema = require('./src/schema').default;
const dataSources = require('./src/dataSources').default;

const app = express();
const server = new ApolloServer({
  ...config('graphql'),
  schema,
  context: ({ req }) => ({
    authorization: req.headers.authorization || '',
  }),
  dataSources,
});

app.use((req, res, next) => {
  // Render customized GraphQL Playground when client asks for HTML:
  if (req.headers.accept && req.headers.accept.includes('text/html')) {
    return res.sendFile(`${__dirname}/src/playground.html`);
  }

  return next();
});

// Start the Apollo GraphQL server.
server.applyMiddleware({ app, path: '*' });
app.listen(config('app.port'), () => {
  const ENV = chalk.yellow.bold(config('services.displayName'));
  const message = `${chalk.bold(
    `Started your local GraphQL server, querying the ${ENV} environment.`,
  )} \nTry it out by visiting ${config('app.url')}.`;

  console.log(boxen(message, { borderColor: 'yellow', margin: 1, padding: 1 }));
});
