import { FontRenderer } from '@statsify/jsx';
import Container from 'typedi';

const renderer = new FontRenderer();
renderer.loadImages();

export const loadFont = () => renderer.loadImages();

Container.set(FontRenderer, renderer);
