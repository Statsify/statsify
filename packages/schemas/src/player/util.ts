import type { APIData } from '@statsify/util';
import { Color, ColorCode, ColorId } from '../color';

export class PlayerUtil {
  public static getRank(data: APIData) {
    let rank = 'DEFAULT';

    if (data.monthlyPackageRank || data.packageRank || data.newPackageRank) {
      if (data.monthlyPackageRank === 'SUPERSTAR') {
        rank = data.monthlyPackageRank;

        if (data.monthlyRankColor && data.monthlyRankColor !== 'GOLD') {
          rank = `bMVP++`;
        }
      } else {
        rank =
          data.packageRank && data.newPackageRank
            ? data.newPackageRank
            : data.packageRank || data.newPackageRank;
      }
    }

    if (data.rank && data.rank !== 'NORMAL') {
      rank = data.rank;
    }

    if (data.prefix) {
      rank = data.prefix.replace(/§.|\[|]/g, '');
    }

    rank = this.replaceRank(rank);

    return rank.length === 0 ? 'DEFAULT' : rank;
  }

  public static getPlusColor(rank: string, plusColor?: ColorId): Color {
    const rankColorMap: Record<string, Color> = {
      'MVP+': new Color('RED'),
      'MVP++': new Color('RED'),
      'bMVP++': new Color('RED'),
      VIP: new Color('GREEN'),
      'VIP+': new Color('GOLD'),
      'PIG+++': new Color('AQUA'),
    };

    if (plusColor === undefined || rank === 'PIG+++' || rank === 'VIP') {
      const rankColor: Color = rankColorMap[rank];

      if (!rankColor) return new Color('GRAY');

      return rankColor;
    }

    const rankColor = new Color(plusColor);

    if (!rankColor) return new Color('GRAY');

    return rankColor;
  }

  public static getRankColor(rank: string): Color {
    switch (rank) {
      case 'YOUTUBE':
      case 'ADMIN':
      case 'OWNER':
      case 'SLOTH':
      case 'MCP':
      case 'MINISTER':
        return new Color('RED');
      case 'PIG++':
        return new Color('LIGHT_PURPLE');
      case 'MOD':
      case 'GM':
        return new Color('DARK_GREEN');
      case 'HELPER':
        return new Color('BLUE');
      case 'BUILD TEAM':
        return new Color('DARK_AQUA');
      case 'MVP++':
      case 'APPLE':
      case 'MOJANG':
        return new Color('GOLD');
      case 'MVP':
      case 'MVP+':
      case 'bMVP++':
        return new Color('AQUA');
      case 'VIP':
      case 'VIP+':
        return new Color('GREEN');
      default:
        return new Color('GRAY');
    }
  }

  public static getDisplayName(username: string, rank: string, plusColor: ColorCode) {
    const rankMap: Record<string, string> = {
      'MVP+': `§b[MVP${plusColor}+§b]`,
      'MVP++': `§6[MVP${plusColor}++§6]`,
      'bMVP++': `§b[MVP${plusColor}++§b]`,
      MVP: '§b[MVP]',
      'VIP+': `§a[VIP${plusColor}+§a]`,
      VIP: `§a[VIP]`,
      YOUTUBE: `§c[§fYOUTUBE§c]`,
      'PIG+++': `§d[PIG${plusColor}+++§d]`,
      HELPER: `§9[HELPER]`,
      MOD: `§2[MOD]`,
      GM: '§2[GM]',
      ADMIN: `§c[ADMIN]`,
      OWNER: `§c[OWNER]`,
      SLOTH: `§c[SLOTH]`,
      ANGUS: `§c[ANGUS]`,
      APPLE: '§6[APPLE]',
      MOJANG: `§6[MOJANG]`,
      'BUILD TEAM': `§3[BUILD TEAM]`,
      EVENTS: `§6[EVENTS]`,
      MINISTER: `§c[MINISTER]`,
      MAYOR: `§d[MAYOR]`,
      DEFAULT: `§7`,
      MCP: `§c[MCP]`,
    };

    const colorRank = rankMap[rank];

    return `${colorRank}${colorRank === '§7' ? '' : ' '}${username}`;
  }

  private static replaceRank(rank: string) {
    return rank
      .replace('SUPERSTAR', 'MVP++')
      .replace('VIP_PLUS', 'VIP+')
      .replace('MVP_PLUS', 'MVP+')
      .replace('MODERATOR', 'MOD')
      .replace('GAME_MASTER', 'GM')
      .replace('YOUTUBER', 'YOUTUBE')
      .replace('NONE', '');
  }
}
