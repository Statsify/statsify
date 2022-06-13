import { INFO_COLOR } from '#constants';
import { Command, EmbedBuilder } from '@statsify/discord';
import { hexToRgb, mcShadow, rgbToHex } from '@statsify/rendering';
import { minecraftColors } from '@statsify/util';

const colors: Record<string, string> = {
  '0': '<:black:734293805502562383>',
  '1': '<:dark_blue:734293805465075843>',
  '2': '<:dark_green:734293805360218153>',
  '3': '<:dark_aqua:734293805402161202>',
  '4': '<:dark_red:734293804995182668>',
  '5': '<:dark_purple:734293805032931390>',
  '6': '<:gold:734293805423132774>',
  '7': '<:gray:734293805028605973>',
  '8': '<:dark_gray:734293805364150372>',
  '9': '<:blue:734293805137920041>',
  a: '<:green:734293805443842088>',
  b: '<:aqua:734293805439647804>',
  c: '<:red:734293805133725788>',
  d: '<:pink:734293805393772594>',
  e: '<:yellow:734293805095845959>',
  f: '<:white:734293804915359786>',
};

const modifiers: Record<string, string> = {
  k: '<a:obfuscatedone:874707376429744188><a:obfuscatedtwo:874707376186470491><a:obfuscatedthree:874707376266162287><a:obfuscatedfour:874707376882741248><:obfuscatedfive:874707376329085000>',
  l: '<:boldone:874702922523500554><:boldtwo:874702922833879060><:boldthree:874702922305376260><:boldfour:874702922301202533><:boldfive:874702922544455680>',
  m: '<:strikethroughone:874704307382026241><:strikethroughtwo:874704307335872532><:strikethroughthree:874704307105189949><:strikethroughfour:874704307382026242><:strikethroughfive:874704307017121855>',
  n: '<:underlinedone:874703813242675210><:underlinedtwo:874703813347520582><:underlinedthree:874703813288816650><:underlinedfour:874703813318156359><:underlinedfive:874703813687259136>',
  o: '<:italicone:874703145454952529><:italictwo:874703145714987018><:italicthree:874703145459122276><:italicfour:874703145069080607><:italicfive:874703145475915806>',
  r: '<:normalone:874702623150858240><:normaltwo:874702623222149160><:normalthree:874702622890819646><:normalfour:874702622890819645><:normalfive:874702623155044463>',
};

@Command({ description: 'commands.colors' })
export class ColorsCommand {
  public async run() {
    const embed = new EmbedBuilder()
      .title((t) => t('embeds.colors.title'))
      .description((t) => {
        let desc = `**${t('embeds.colors.description.color')} • ${t(
          'embeds.colors.description.mainHex'
        )} • ${t('embeds.colors.description.shadowHex')}**\n`;

        minecraftColors.forEach((color) => {
          desc += `${colors[color.code.slice(1)]} \`${color.code}\` • \`${
            color.hex
          }\` • \`${rgbToHex(mcShadow(hexToRgb(color.hex)))}\`\n`;
        });

        desc += '\n';
        desc += `${modifiers.k} \`§k\` • ${t('embeds.colors.description.obfuscated')}\n`;
        desc += `${modifiers.l} \`§l\` • **${t('embeds.colors.description.bold')}**\n`;
        desc += `${modifiers.m} \`§m\` • ~~${t('embeds.colors.description.strikethrough')}~~\n`;
        desc += `${modifiers.n} \`§n\` • _${t('embeds.colors.description.underline')}_\n`;
        desc += `${modifiers.o} \`§o\` • *${t('embeds.colors.description.italic')}*\n`;
        desc += `${modifiers.r} \`§r\` • ${t('embeds.colors.description.reset')}\n`;

        return desc;
      })
      .color(INFO_COLOR);

    return {
      embeds: [embed],
    };
  }
}
