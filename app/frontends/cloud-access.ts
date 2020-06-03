import { Credentials } from 'aws-sdk/clients/sts';
import SecureTokenService from '../util/sts';
import RequestContext from '../models/request-context';

import env = require('util/env');
const { sameRegionAccessRole, awsDefaultRegion } = env;

// Allow tokens to last up to 8 hours - no reason to make this a configuration yet
const expirationSeconds = 3600 * 8;

/**
 * Makes a call to assume a role that has access to S3 outputs generated by Harmony
 *
 * @param {RequestContext} context The request context
 * @param {string} username The user making the request
 * @returns {Promise<Credentials>} credentials to act as that role
 */
async function _assumeS3OutputsRole(
  context: RequestContext, username: string,
): Promise<Credentials> {
  const { id } = context;
  const params = {
    RoleArn: sameRegionAccessRole,
    RoleSessionName: username,
    DurationSeconds: expirationSeconds,
    ExternalId: id,
  };
  const sts = new SecureTokenService();
  const response = await sts.assumeRole(params);
  return response.Credentials;
}

/**
 * Express.js handler that handles the cloud access JSON endpoint (/cloud-access)
 *
 * @param {http.IncomingMessage} req The request sent by the client
 * @param {http.ServerResponse} res The response to send to the client
 * @returns {Promise<void>} Resolves when the request is complete
 */
export async function cloudAccessJson(req, res): Promise<void> {
  req.context.logger = req.context.logger.child({ component: 'cloudAccess.cloudAccessJson' });
  req.context.logger.info(`Generating same region access keys for ${req.user}`);
  try {
    const credentials = await _assumeS3OutputsRole(req.context, req.user);
    res.send(credentials);
  } catch (e) {
    req.context.logger.error(e);
    res.status(500);
    res.json({
      code: 'harmony:ServerError',
      description: 'Error: Failed to assume role to generate access keys',
    });
  }
}

const preamble = '#!/bin/sh\n# Source this file to set keys to access Harmony S3 outputs '
  + `within the ${awsDefaultRegion} region.\n`;

const awsFieldMappings = {
  AccessKeyId: 'AWS_ACCESS_KEY_ID',
  SecretAccessKey: 'AWS_SECRET_ACCESS_KEY',
  SessionToken: 'AWS_SESSION_TOKEN',
};

/**
 * Express.js handler that handles the cloud access shell endpoint (/cloud-access.sh)
 *
 * @param {http.IncomingMessage} req The request sent by the client
 * @param {http.ServerResponse} res The response to send to the client
 * @returns {Promise<void>} Resolves when the request is complete
 */
export async function cloudAccessSh(req, res): Promise<void> {
  req.context.logger = req.context.logger.child({ component: 'cloudAccess.cloudAccessSh' });
  req.context.logger.info(`Generating same region access keys for ${req.user}`);
  res.set('Content-Type', 'application/x-sh');
  try {
    const credentials = await _assumeS3OutputsRole(req.context, req.user);
    let response = preamble;
    response += `# Keys will expire on ${credentials.Expiration.toUTCString()}\n\n`;
    for (const key of Object.keys(awsFieldMappings)) {
      response += `export ${awsFieldMappings[key]}='${credentials[key]}'\n`;
    }
    res.send(response);
  } catch (e) {
    req.context.logger.error(e);
    res.status(500);
    res.send('>&2 echo "Error: Failed to assume role to generate access keys"');
  }
}
