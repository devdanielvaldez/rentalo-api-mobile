const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const Sequence = require('./Schemas/sequence');
const { createScheduleEmail } = require('./notifications');
const { cancelSchedulledEmail } = require('./cancelSchedulledEmail');
const clientId = process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});
const pollIdleWait = +(process.env.POLL_IDLE_WAIT_TIME || 6000);

const pollWait = +(process.env.POLL_WAIT_TIME || 100 * 6);

const WATCH_EVENTS_LIST = ['listing/created', 'listing/updated'];
const queryEvents = async params => {
  const response = await integrationSdk.events.query(params);
  return response;
};
const loadLastEventSequenceId = async () => {
  let sequenceDoc;
  try {
    sequenceDoc = await Sequence.findOne({ isSequence: true });
    console.log({ oldSequenceId: sequenceDoc?.sequenceId });
    if (sequenceDoc) return Number(sequenceDoc.sequenceId);
    return 0;
  } catch (e) {
    console.log(e);
    return null;
  }
};
const saveLastSequenceId = async (sequenceId, resolve) => {
  try {
    await Sequence.updateOne({ isSequence: true }, { sequenceId }, { upsert: true });
    console.log({ saved: true, sequenceId: sequenceId });
    if (resolve) resolve();

    return true;
  } catch (e) {
    console.log(e);
    return new Promise(resolve => setTimeout(() => saveLastSequenceId(sequenceId, resolve), 30000));
  }
};
async function listingCreated(event) {
  try {
    const eventAttribs = event.attributes;
    const { resource } = eventAttribs;
    const listingId = resource?.id?.uuid;
    const authorId = resource?.relationships?.author?.data?.id?.uuid;
    if (listingId) {
      const reminder = await createScheduleEmail(authorId, listingId);
    }
  } catch (e) {
    console.log(e);
  }
}
async function listingUpdated(event) {
  try {
    const eventAttribs = event.attributes;
    const { resource, previousValues } = eventAttribs;
    const previousState = previousValues?.attributes?.state;
    const prevPendingApproval =
      typeof previousState != 'undefined' && previousState == 'pendingApproval';
    const newState = resource?.attributes?.state;
    const publishedListing = prevPendingApproval && newState == 'published';

    const listingId = resource?.id?.uuid;
    const { attributes } = resource || {};
    const { metadata } = attributes || {};
    const { batchId } = metadata || {};
    if (publishedListing && batchId) {
      console.log('Cancelling email----------------------------->');
      await cancelSchedulledEmail(batchId);
    }
  } catch (e) {
    console.log(e);
  }
}

const analyzeEvents = async (events, index) => {
  if (!events?.[index]) return events[index - 1].attributes.sequenceId;
  const event = events[index];

  const attrs = event.attributes;

  const eventType = attrs.eventType;
  switch (eventType) {
    case 'listing/updated':
      await listingUpdated(event);
      break;
    case 'listing/created':
      await listingCreated(event);
      break;
  }
  await saveLastSequenceId(event.attributes.sequenceId);
  return analyzeEvents(events, index + 1);
};

const pollLoop = sequenceId => {
  if (typeof sequenceId == 'undefined') {
    return console.log('Events not running because of database error');
  }
  let params = {
    eventTypes: WATCH_EVENTS_LIST,
  };
  params = sequenceId
    ? {
        ...params,
        startAfterSequenceId: sequenceId,
      }
    : params;

  queryEvents(params)
    .then(async res => {
      const events = res.data.data;
      const fullPage = events.length === res.data.meta.perPage;
      const delay = fullPage ? pollWait : pollIdleWait;
      let lastSequenceId = sequenceId;
      if (events.length) {
        lastSequenceId = await analyzeEvents(events, 0);
      }
      setTimeout(() => {
        pollLoop(lastSequenceId);
      }, delay);
    })
    .catch(e => {
      // console.dir(e.data.errors, { depth: 12 });
      console.log(`Failed to log events because of ${e?.message}`);
    });
};

// kick off the polling loop

const watchSharetribeEvents = async () => {
  const resolvedSequenceId = await loadLastEventSequenceId();
  if (resolvedSequenceId != null) {
    pollLoop(resolvedSequenceId);
  } else {
    setTimeout(() => watchSharetribeEvents(), 30000);
  }
};

module.exports = watchSharetribeEvents;
