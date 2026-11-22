import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {PrismaClient} from '@prisma/client';
/** Optimistic review patch: never reset, add questions or alter answer keys/IDs. */
async function main(){
 const file=process.argv[2];if(!file)throw new Error('Provide output report path');
 const reportRelative=path.relative(process.cwd(),path.resolve(file));if(reportRelative.startsWith('..')||path.isAbsolute(reportRelative))throw new Error('Report must stay inside project');
 fs.mkdirSync(path.dirname(path.resolve(file)),{recursive:true});
 if(fs.existsSync('.env'))process.loadEnvFile('.env');const db=new PrismaClient();
 try{
  const location=(await db.$queryRawUnsafe<{name:string;file:string}[]>('PRAGMA database_list')).find(d=>d.name==='main')?.file;
  if(!location)throw new Error('SQLite required');const relative=path.relative(fs.realpathSync('.'),fs.realpathSync(location));if(relative.startsWith('..')||path.isAbsolute(relative))throw new Error('Database outside project');
  const patch=JSON.parse(fs.readFileSync('content/expansion-quiz-patch.json','utf8')) as {slug:string;order:number;before:{prompt:string;options:string[];correct:number;explanation:string};after:{prompt:string;options:string[];correct:number;explanation:string}}[];
  const backup=path.resolve('.local/backups',`expansion-${Date.now()}.db`);fs.mkdirSync(path.dirname(backup),{recursive:true});await db.$executeRawUnsafe('VACUUM INTO ?',backup);
  const result=await db.$transaction(async tx=>{
   const changes:string[]=[],already:string[]=[],conflicts:string[]=[];
   for(const p of patch){
    assert.deepEqual(p.before.options,p.after.options);assert.equal(p.before.correct,p.after.correct);
    const q=await tx.quizQuestion.findFirst({where:{order:p.order,quiz:{lesson:{slug:p.slug}}}});
    if(!q){conflicts.push(`${p.slug}/${p.order}: missing`);continue;}
    const current={prompt:q.prompt,options:JSON.parse(q.optionsJson),correct:q.correctIndex,explanation:q.explanation};
    if(JSON.stringify(current)===JSON.stringify(p.after)){already.push(q.id);continue;}
    if(JSON.stringify(current)!==JSON.stringify(p.before)){conflicts.push(`${p.slug}/${p.order}: edited independently, preserved`);continue;}
    await tx.quizQuestion.update({where:{id:q.id},data:{prompt:p.after.prompt,explanation:p.after.explanation}});changes.push(q.id);
   }return {changes,already,conflicts};
  });
  const report={checkedAt:new Date().toISOString(),backup:path.relative('.',backup),...result};
  fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }finally{await db.$disconnect();}
}main().catch(e=>{console.error(e);process.exitCode=1;});
