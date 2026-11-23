/**
 * Copyright (c) Statsify
 *
 * This source code is licensed under the GNU AGPL v3 or later license found in the
 * LICENSE file in the root directory of this source tree.
 * https://github.com/Statsify/statsify/blob/main/LICENSE
 */

import { ClockScript } from "~/lib/clock";
import { Hint, Spoken } from "~/components/ui/hint";
import { relativeTime, shortDate } from "~/i18n/format";
import { useNow } from "./refresh-bar";
import { useTranslation } from "react-i18next";

const twoDigits = (value: number) => String(value).padStart(2, "0");

/**
 * The card's `LL/dd/yy, hh:mm a` in UTC, from the date's parts rather than `Intl`: ICU versions differ in the space
 * before AM/PM, so the server's text and the browser's could differ and break hydration.
 */
function loginText(ms: number): string {
  const date = new Date(ms);
  const hours = date.getUTCHours();
  const day = `${twoDigits(date.getUTCMonth() + 1)}/${twoDigits(date.getUTCDate())}/${twoDigits(date.getUTCFullYear() % 100)}`;
  return `${day}, ${twoDigits(hours % 12 || 12)}:${twoDigits(date.getUTCMinutes())} ${hours < 12 ? "AM" : "PM"}`;
}

/**
 * A login date in the visitor's zone. Once the page has mounted, how long ago it was and the card's UTC show on hover,
 * focus or tap. The HTML has UTC, as the server can't know the zone; `ClockScript` puts the browser's in its place
 * before first paint. Under a link, which owns the tap, only screen readers get how long ago.
 */
export function LoginDate({ ms, linked = false }: { ms: number; linked?: boolean }) {
  const { t, i18n } = useTranslation();
  const now = useNow();
  if (ms <= 0) return t("player.na");

  const utc = `${loginText(ms)} UTC`;
  // `now` is undefined while hydrating, so the server's HTML and the first render carry no clock value.
  const text = now === undefined ? utc : shortDate(ms, i18n.language);
  const ago = now === undefined ? undefined : relativeTime(ms, now, i18n.language);

  const time = <time dateTime={new Date(ms).toISOString()} suppressHydrationWarning>{text}</time>;

  return (
    <>
      {linked ?
        <Spoken full={ago && `${text}, ${ago}`}>{time}</Spoken> :
        <Hint full={ago && `${ago} · ${utc}`} spoken={ago && `${text}, ${ago}`}>{time}</Hint>}
      <ClockScript args={{ at: ms, locale: i18n.language }} />
    </>
  );
}
