import { has } from 'lodash';

/**
 * Transform a string constant into a GraphQL-style enum.
 *
 * @param  {String} string
 * @return {String}
 */
export const stringToEnum = string => {
  if (!string) {
    return null;
  }

  return string.toUpperCase().replace('-', '_');
};

/**
 * Transform a list into a list of GraphQL-style enums.
 *
 * @param  {String} string
 * @return {String}
 */
export const listToEnums = list => {
  if (!list) {
    return null;
  }

  return list.map(stringToEnum);
};

/**
 * See if a user has the given feature flag and what its value is.
 *
 * @param  {Object} user
 * @param  {String} flagName

 * @return {Boolean}
 */
export const hasFeatureFlag = (user, flagName) =>
  has(user, `featureFlags.${flagName}`) ? user.featureFlags[flagName] : null;

export default null;
