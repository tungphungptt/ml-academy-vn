import {defineConfig} from '@playwright/test';
import base from './playwright.config';
const phase=process.env.APPLE_DESIGN_PHASE==='before'?'before':'after';
export default defineConfig({
  ...base,testMatch:'apple-design.spec.ts',testIgnore:[],
  outputDir:'test-results/apple-design',
  reporter:[['list'],['json',{outputFile:`docs/${process.env.DESIGN_REPORT_PREFIX??'neuralclone-apple'}-${phase}-results.json`}]],
  projects:phase==='before'?[{name:'chrome',use:{browserName:'chromium',channel:'chrome',launchOptions:{channel:'chrome'}}}]:[
    {name:'chrome',use:{browserName:'chromium',channel:'chrome',launchOptions:{channel:'chrome'}}},
    {name:'firefox',use:{browserName:'firefox',launchOptions:{}}},
    {name:'webkit',use:{browserName:'webkit',launchOptions:{}}},
  ],
});
