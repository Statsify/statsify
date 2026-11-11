/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { Field } from "#metadata";

/** A profile another account proved it owns, which the account it left hasn't been shown yet. */
export class AccountNotice {
  @Field()
  public uuid: string;

  @Field()
  public movedAt: number;
}

/**
 * A login on the site. It holds the login identities, one of each kind; the Minecraft profiles it owns point back
 * to it from `AccountProfile.accountId`.
 */
export class Account {
  @Field({ mongo: { index: true, unique: true } })
  public id: string;

  /** The Discord user it logs in with, the bot's `User.id`. Bot settings are that `User`'s. */
  @Field({ mongo: { index: true, unique: true, sparse: true }, store: { required: false } })
  public discordId?: string;

  /** One of its profiles: the bot's verified UUID for `discordId`. Unset while it owns none. */
  @Field({ store: { required: false } })
  public primaryUuid?: string;

  @Field()
  public createdAt: number;

  @Field({ type: () => [AccountNotice], store: { required: false } })
  public notices?: AccountNotice[];
}

/**
 * A Minecraft profile claimed on the site, keyed by UUID; its page options will live here. Unlinking clears
 * `accountId` and keeps the record, so claiming it again brings the options back.
 */
export class AccountProfile {
  @Field({ mongo: { index: true, unique: true } })
  public uuid: string;

  @Field({ mongo: { index: true, sparse: true }, store: { required: false } })
  public accountId?: string;

  /** When it was last linked; the account's oldest link is its next primary. */
  @Field()
  public linkedAt: number;
}
