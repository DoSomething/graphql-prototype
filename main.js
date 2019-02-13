//
// This is our AWS Lambda entry point.
//

// Attach global 'fetch' polyfill.
fetch = require('node-fetch');

const { ApolloServer } = require('apollo-server-lambda');
const schema = require('./lib/src/schema').default;
const config = require('./lib/config').default;
const fs = require('fs');

const server = new ApolloServer({
  ...config('graphql'),
  schema,
  context: ({ event }) => ({
    authorization: event.headers.Authorization,
  }),
});

exports.handler = (event, context, callback) => {
  // Render customized GraphQL Playground when client asks for HTML:
  const accept = event.headers.Accept || event.headers.accept;
  if (event.httpMethod === 'GET' && accept && accept.includes('text/html')) {
    return callback(null, {
      statusCode: 200,
      body: fs.readFileSync(`${__dirname}/src/playground.html`),
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }

  // Enable CORS for cross-domain usage.
  const handlerSettings = {
    cors: {
      origin: '*',
      credentials: true,
      allowedHeaders: ['content-type', 'authorization'],
    },
  };

  return server.createHandler(handlerSettings)(event, context, callback);
};
