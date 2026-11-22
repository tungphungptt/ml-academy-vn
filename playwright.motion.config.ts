import {defineConfig} from '@playwright/test';import base from './playwright.apple.config';
export default defineConfig({...base,testMatch:'studio-motion.spec.ts',reporter:[['list'],['json',{outputFile:'docs/neuralclone-refinement-motion-results.json'}]]});
