import { renderSkin } from "@statsify/skin-renderer";
import { writeFile } from "node:fs/promises";

const response = await fetch("URL_TO_SKIN");
const skin = await response.arrayBuffer();

const render = await renderSkin(new Uint8Array(skin), true, true);
await writeFile("render.png", render);