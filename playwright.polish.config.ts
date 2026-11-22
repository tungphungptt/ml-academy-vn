import {defineConfig} from '@playwright/test';
import base from './playwright.exhibition.config';
export default defineConfig({...base,projects:base.projects?.map(project=>({...project,testMatch:[...(Array.isArray(project.testMatch)?project.testMatch:[project.testMatch!]),'polish.spec.ts']})),outputDir:'.local/polish-current-e2e',reporter:'list'});
