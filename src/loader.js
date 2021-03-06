import logger from 'heroku-logger';
import DataLoader from 'dataloader';
import { FieldDataLoader } from 'fielddataloader';

import { getEmbed } from './repositories/embed';
import {
  getActionsByCampaignId,
  getActionById,
  getCampaignById,
  getClubById,
  getGroupById,
  getGroupTypeById,
  getSignupsById,
} from './repositories/rogue';
import { getUserById } from './repositories/northstar';
import { getConversationById } from './repositories/gambit';
import {
  getGambitContentfulEntryById,
  getGambitContentfulAssetById,
} from './repositories/contentful/gambit';
import { authorizedRequest } from './repositories/helpers';
import {
  getPageBySlug,
  getCausePageBySlug,
  getCompanyPageBySlug,
  getAffiliateByUtmLabel,
  getCollectionPageBySlug,
  getPhoenixContentfulAssetById,
  getPhoenixContentfulEntryById,
  getCampaignWebsiteByCampaignId,
  getVoterRegistrationMarketingPageBySlug,
} from './repositories/contentful/phoenix';

/**
 * The data loader handles batching and caching the backend
 * requests needed for a single GraphQL query.
 *
 * @var {DataLoader}
 */
export default (context, preview = false) => {
  // Keep track of whether or not we're in "preview" mode:
  if (preview) {
    context.preview = true;
  }

  // If this is a new GraphQL request, configure a loader.
  if (!context.loader) {
    logger.debug('Creating a new loader for this GraphQL request.');
    const options = authorizedRequest(context);
    // to keep our naming consistent for loaders, our convention will base plurality on the relationship between the data being queried
    // i.e. actionsByCampaignId follows the convention of one campaign having many actions
    // @TODO update some loader names to follow this established pattern
    context.loader = {
      actionsByCampaignId: new DataLoader(campaignIds =>
        Promise.all(campaignIds.map(id => getActionsByCampaignId(id, context))),
      ),
      actions: new DataLoader(ids =>
        Promise.all(ids.map(id => getActionById(id, options))),
      ),
      affiliates: new DataLoader(utmLabels =>
        Promise.all(
          utmLabels.map(utmLabel => getAffiliateByUtmLabel(utmLabel, context)),
        ),
      ),
      assets: new DataLoader(ids =>
        Promise.all(ids.map(id => getPhoenixContentfulAssetById(id, context))),
      ),
      blocks: new DataLoader(ids =>
        Promise.all(ids.map(id => getPhoenixContentfulEntryById(id, context))),
      ),
      broadcasts: new DataLoader(ids =>
        Promise.all(ids.map(id => getGambitContentfulEntryById(id, options))),
      ),
      campaigns: new DataLoader(ids =>
        Promise.all(ids.map(id => getCampaignById(id, options))),
      ),
      campaignWebsites: new DataLoader(ids =>
        Promise.all(ids.map(id => getPhoenixContentfulEntryById(id, context))),
      ),
      campaignWebsiteByCampaignIds: new DataLoader(campaignIds =>
        Promise.all(
          campaignIds.map(campaignId =>
            getCampaignWebsiteByCampaignId(campaignId, context),
          ),
        ),
      ),
      causePagesBySlug: new DataLoader(slugs =>
        Promise.all(slugs.map(slug => getCausePageBySlug(slug, context))),
      ),
      collectionPagesBySlug: new DataLoader(slugs =>
        Promise.all(slugs.map(slug => getCollectionPageBySlug(slug, context))),
      ),
      companyPagesBySlug: new DataLoader(slugs =>
        Promise.all(slugs.map(slug => getCompanyPageBySlug(slug, context))),
      ),
      conversations: new DataLoader(ids =>
        Promise.all(ids.map(id => getConversationById(id, options))),
      ),
      embeds: new DataLoader(urls =>
        Promise.all(urls.map(url => getEmbed(url))),
      ),
      gambitAssets: new DataLoader(ids =>
        Promise.all(ids.map(id => getGambitContentfulAssetById(id, context))),
      ),
      clubs: new FieldDataLoader((id, fields) =>
        getClubById(id, fields, options),
      ),
      groups: new FieldDataLoader((id, fields) =>
        getGroupById(id, fields, options),
      ),
      groupTypes: new FieldDataLoader((id, fields) =>
        getGroupTypeById(id, fields, options),
      ),
      pages: new DataLoader(ids =>
        Promise.all(ids.map(id => getPhoenixContentfulEntryById(id, context))),
      ),
      pagesBySlug: new DataLoader(slugs =>
        Promise.all(slugs.map(slug => getPageBySlug(slug, context))),
      ),
      signups: new DataLoader(ids => getSignupsById(ids, options)),
      storyPageWebsites: new DataLoader(ids =>
        Promise.all(ids.map(id => getPhoenixContentfulEntryById(id, context))),
      ),
      topics: new DataLoader(ids =>
        Promise.all(ids.map(id => getGambitContentfulEntryById(id, options))),
      ),
      users: new FieldDataLoader((id, fields) =>
        getUserById(id, fields, context),
      ),
      voterRegistrationMarketingPageBySlug: new DataLoader(slugs =>
        Promise.all(
          slugs.map(slug =>
            getVoterRegistrationMarketingPageBySlug(slug, context),
          ),
        ),
      ),
    };
  }

  return context.loader;
};
