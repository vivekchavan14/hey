import type { Handler } from 'express';

import { HeyLensSignup } from '@hey/abis';
import { HEY_LENS_SIGNUP } from '@hey/data/constants';
import logger from '@hey/lib/logger';
import catchedError from 'src/lib/catchedError';
import { RPC_URL, SWR_CACHE_AGE_10_MINS_30_DAYS } from 'src/lib/constants';
import { noBody } from 'src/lib/responses';
import { createPublicClient, http } from 'viem';
import { polygon } from 'viem/chains';

// TODO: add tests
export const get: Handler = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return noBody(res);
  }

  try {
    const client = createPublicClient({
      chain: polygon,
      transport: http(RPC_URL)
    });

    const isHeyProfile = await client.readContract({
      abi: HeyLensSignup,
      address: HEY_LENS_SIGNUP,
      args: [id],
      functionName: 'profileCreated'
    });

    logger.info(`Hey profile badge fetched for ${id}`);

    return res
      .status(200)
      .setHeader('Cache-Control', SWR_CACHE_AGE_10_MINS_30_DAYS)
      .json({ isHeyProfile, success: true });
  } catch (error) {
    return catchedError(res, error);
  }
};
