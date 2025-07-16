import init, {  SkinRenderer, SkinMessenger } from "@statsify/skin-renderer/wasm"

await init();

const renderer = new SkinRenderer();
renderer.run();

const response = await fetch("URL_TO_SKIN");
const skin = await response.arrayBuffer();

SkinMessenger.registerCanvas("skin");
SkinMessenger.renderSkin("skin", new Uint8Array(skin), true, true);
