import {defineConfig} from '@playwright/test';
import base from './playwright.apple.config';
const matches=['learning-refinement.spec.ts','curriculum.spec.ts'];
export default defineConfig({...base,testMatch:matches,testIgnore:[],projects:base.projects?.map(project=>({...project,testMatch:project.name==='chrome'?matches:['learning-refinement.spec.ts']})),outputDir:'.local/refinement-e2e',reporter:'list'});
