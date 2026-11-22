import {defineConfig} from '@playwright/test';
import base from './playwright.apple.config';
const chrome=['workspace.spec.ts','ui.spec.ts','neuralclone.spec.ts','learning-refinement.spec.ts','curriculum.spec.ts'];
export default defineConfig({...base,testMatch:chrome,testIgnore:[],projects:base.projects?.map(project=>({...project,testMatch:project.name==='chrome'?chrome:['workspace.spec.ts','learning-refinement.spec.ts']})),outputDir:'.local/workspace-e2e',reporter:'list'});
