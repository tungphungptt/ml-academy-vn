import { PrismaClient, type Dataset } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// Target only exact release values: retain any administrator edits and IDs.
async function repair() {
  if(fs.existsSync('.env')) process.loadEnvFile('.env');
  const db=new PrismaClient();
  try {
    const files=await db.$queryRawUnsafe<{name:string;file:string}[]>('PRAGMA database_list');
    const actual=files.find(f=>f.name==='main')?.file;
    if(!actual) throw new Error('Expected local SQLite.');
    const root=fs.realpathSync(process.cwd()), relative=path.relative(root,fs.realpathSync(actual));
    if(!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Database is outside the project.');
    const snapshot=async()=>({users:await db.user.findMany({select:{id:true}}),progress:await db.lessonProgress.findMany(),attempts:await db.quizAttempt.findMany(),notes:await db.note.findMany({select:{id:true,userId:true,lessonId:true}}),bookmarks:await db.bookmark.findMany(),study:await db.studyTime.findMany()});
    const before=await snapshot();
    type DatasetSource = {slug:string;license:string;url:string};
    const datasets=JSON.parse(fs.readFileSync('content/datasets.json','utf8')) as DatasetSource[];
    const oldQuiz='A có r*d_in, B có d_out*r; chưa tính bias/module khác.';
    const newQuiz='A có `r*d_in`, B có `d_out*r`; chưa tính bias/module khác.';
    const questions=await db.quizQuestion.findMany({where:{explanation:oldQuiz,quiz:{lesson:{slug:'efficient-finetuning'}}}});
    const patches: {row:Dataset;source:DatasetSource}[]=[];
    for(const source of datasets){
      const row=await db.dataset.findUnique({where:{slug:source.slug}});
      if(row && (/^Đi kèm scikit-learn \(BSD-3\)\./.test(row.license) ||
        (row.license===source.license && row.url===source.url.replace('#','')))) patches.push({row,source});
    }
    let backup:string|null=null;
    if(questions.length || patches.length){
      backup=path.resolve('.local','backups',`neuralclone-reviewed-metadata-${Date.now()}.db`);
      fs.mkdirSync(path.dirname(backup),{recursive:true});
      await db.$executeRawUnsafe('VACUUM INTO ?',backup);
      await db.$transaction(async tx=>{
        for(const {row,source} of patches) await tx.dataset.updateMany({where:{id:row.id,license:row.license,url:row.url},data:{license:source.license,url:source.url}});
        for(const q of questions) await tx.quizQuestion.updateMany({where:{id:q.id,explanation:oldQuiz},data:{explanation:newQuiz}});
      });
    }
    assert.deepEqual(await snapshot(),before);
    const result={checkedAt:new Date().toISOString(),datasetsCorrected:patches.map(p=>p.row.slug),quizExplanationsCorrected:questions.length,userRowsPreserved:true,backup:backup?path.relative(root,backup):null};
    fs.writeFileSync(`docs/neuralclone-metadata-${backup?'repair':'idempotency'}.json`,JSON.stringify(result,null,2)+'\n');
    console.log(JSON.stringify(result));
  }finally{await db.$disconnect();}
}
repair().catch(e=>{console.error(e);process.exitCode=1;});
