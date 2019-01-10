import logger from 'heroku-logger';
import { map } from 'lodash';

import config from '../../config';
import { transformResponse } from './helpers';

const GAMBIT_CONVERSATIONS_URL = config('services.gambitConversations.url');
const GAMBIT_CONVERSATIONS_AUTH = `${config(
  'services.gambitConversations.user',
)}:${config('services.gambitConversations.pass')}`;

// TODO: Add Northstar token support to Gambit Conversations, use helpers.authorizedRequest
const authorizedRequest = () => ({
  headers: {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(GAMBIT_CONVERSATIONS_AUTH).toString(
      'base64',
    )}`,
  },
});

/**
 * Transform an individual item response.
 * TODO: Modify Conversations API to return data object to deprecate this function.
 *
 * @param {Object} json
 * @return {Object}
 */
export const transformItem = json => transformResponse(json);

/**
 * Transform a collection response.
 * TODO: Modify Conversations API to return data object to deprecate this function.
 *
 * @param {Object} json
 * @return {Object}
 */
export const transformCollection = json => map(json, transformResponse);

/**
 * Fetch a conversation from Gambit by ID.
 *
 * @param {String} id
 * @return {Object}
 */
export const getConversationById = async (id, context) => {
  logger.debug('Loading conversation from Gambit', { id });
  try {
    const response = await fetch(
      `${GAMBIT_CONVERSATIONS_URL}/api/v1/conversations/${id}`,
      authorizedRequest(context),
    );
    const json = await response.json();

    return transformItem(json);
  } catch (exception) {
    const error = exception.message;
    logger.warn('Unable to load conversation.', { id, error, context });
  }

  return null;
};

/**
 * Fetch conversations from Gambit.
 *
 * @param {String} id
 * @param {Number} count
 * @param {Number} page
 * @param {String} orderBy
 * @return {Array}
 */
export const getConversations = async (args, context) => {
  const response = await fetch(
    `${GAMBIT_CONVERSATIONS_URL}/api/v1/conversations`,
    authorizedRequest(context),
  );

  const json = await response.json();

  return transformCollection(json);
};

/**
 * Fetch conversations from Gambit by user ID.
 *
 * @param {String} id
 * @return {Array}
 */
export const getConversationsByUserId = async (args, context) => {
  const userId = args.id;
  logger.debug('Loading user conversations from Gambit', { id: userId });

  const response = await fetch(
    `${GAMBIT_CONVERSATIONS_URL}/api/v1/conversations?query={"userId":"${
      userId
    }"}`,
    authorizedRequest(context),
  );

  const json = await response.json();

  return transformCollection(json);
};

/**
 * Fetch a message from Gambit by ID.
 *
 * @param {String} id
 * @return {Object}
 */
export const getMessageById = async (id, context) => {
  logger.debug('Loading message from Gambit', { id });
  try {
    const response = await fetch(
      `${GAMBIT_CONVERSATIONS_URL}/api/v1/messages/${id}`,
      authorizedRequest(context),
    );
    const json = await response.json();

    return transformItem(json);
  } catch (exception) {
    const error = exception.message;
    logger.warn('Unable to load message.', { id, error, context });
  }

  return null;
};
/**
 * Fetch messages from Gambit by conversation ID.
 *
 * @param {String} id
 * @return {Array}
 */
export const getMessagesByConversationId = async (
  id,
  page,
  count = 25,
  context,
) => {
  logger.debug('Loading conversation messages from Gambit', { id });

  const response = await fetch(
    `${GAMBIT_CONVERSATIONS_URL}/api/v1/messages?query={"conversationId":"${
      id
    }"}&limit=${count}&sort=-createdAt`,
    authorizedRequest(context),
  );

  const json = await response.json();

  return transformCollection(json);
};

export default null;