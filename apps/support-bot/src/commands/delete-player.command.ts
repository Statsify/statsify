/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU GPL v3 license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ApiService, Command, CommandContext, EmbedBuilder, ErrorMessage, PlayerArgument } from "@statsify/discord";
import { STATUS_COLORS } from "@statsify/logger";
import { UserTier } from "@statsify/schemas";

@Command({
	description: (t) => t("commands.delete-player"),
	args: [new PlayerArgument("player", true)],
	tier: UserTier.STAFF,
})
export class DeletePlayerCommand {
	public constructor(private readonly apiService: ApiService) {}

	public async run(context: CommandContext) {
		const player = await this.apiService.getPlayer(context.option("player"));
		const deleted = await this.apiService.deletePlayer(player.uuid);

		if (!deleted)
			throw new ErrorMessage(
				(t) => t("errors.invalidPlayer.title"),
				(t) =>
					t("errors.invalidPlayer.description", {
						type: "username",
						name: player.username,
					})
			);

		const embed = new EmbedBuilder()
			.color(STATUS_COLORS.success)
			.title((t) => t("embeds.deletePlayer.title"))
			.description((t) =>
				t("embeds.deletePlayer.description", {
					displayName: this.apiService.emojiDisplayName(t, player.displayName),
				})
			);

		return { embeds: [embed] };
	}
}
