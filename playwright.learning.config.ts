import {defineConfig} from '@playwright/test';import base from './playwright.apple.config';
export default defineConfig({...base,testMatch:'learning-experiments.spec.ts',testIgnore:[],outputDir:'test-results/learning-expansion',reporter:[['list'],['json',{outputFile:'docs/neuralclone-expansion-browser-results.json'}]]});
