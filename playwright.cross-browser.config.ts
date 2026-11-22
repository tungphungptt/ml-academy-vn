import {defineConfig} from '@playwright/test';
import base from './playwright.config';

// Reuse the isolated SQLite/port guards. Never run auth tests on port 3000.
export default defineConfig({
  ...base,
  testMatch:'cross-browser.spec.ts',
  testIgnore:[],
  outputDir:'test-results/cross-browser',
  reporter:[['list'],['json',{outputFile:'docs/neuralclone-cross-browser-results.json'}]],
  projects:[
    {name:'firefox',use:{browserName:'firefox',launchOptions:{}}},
    {name:'webkit',use:{browserName:'webkit',launchOptions:{}}},
    {name:'chrome-control',use:{browserName:'chromium',channel:'chrome',launchOptions:{channel:'chrome'}}},
  ],
});
