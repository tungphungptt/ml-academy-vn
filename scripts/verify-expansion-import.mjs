import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {spawnSync} from 'node:child_process';

// Only operate on a new project-local copy. Never pass the live database to the importer here.
const folder=path.resolve('.local',`expansion-import-test-${Date.now()}`);
fs.mkdirSync(folder,{recursive:true});
const fixture=path.join(folder,'app.db');
fs.copyFileSync('.local/expansion-start/before.db',fixture);
const db=new DatabaseSync(fixture);
const patch=JSON.parse(fs.readFileSync('content/expansion-quiz-patch.json','utf8'));
const selected=db.prepare('SELECT q.* FROM QuizQuestion q JOIN Quiz z ON z.id=q.quizId JOIN Lesson l ON l.id=z.lessonId WHERE l.slug=? AND q."order"=?').get(patch[0].slug,patch[0].order);
db.prepare('UPDATE QuizQuestion SET explanation=? WHERE id=?').run('Independent teacher revision — preserve this',selected.id);
const lesson=db.prepare('SELECT lessonId FROM Quiz WHERE id=?').get(selected.quizId).lessonId;
db.exec(`INSERT INTO User(id,email,passwordHash) VALUES('test-learner','fixture@example.invalid','not-a-real-password');`);
db.prepare('INSERT INTO LessonProgress(userId,lessonId) VALUES(?,?)').run('test-learner',lesson);
db.prepare('INSERT INTO QuizAttempt(id,userId,quizId,score,total) VALUES(?,?,?,?,?)').run('test-attempt','test-learner',selected.quizId,1,2);
db.prepare('INSERT INTO Note(id,userId,lessonId,body) VALUES(?,?,?,?)').run('test-note','test-learner',lesson,'Keep this note');
db.prepare('INSERT INTO Bookmark(userId,lessonId) VALUES(?,?)').run('test-learner',lesson);
db.prepare('INSERT INTO StudyTime(userId,lessonId,seconds) VALUES(?,?,?)').run('test-learner',lesson,42);
const snapshot=()=>Object.fromEntries(db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name<>'QuizQuestion'").all().map(({name})=>[name,db.prepare(`SELECT * FROM "${name}" ORDER BY rowid`).all()]));
const before=snapshot(), keys=db.prepare('SELECT id,quizId,optionsJson,correctIndex,"order" FROM QuizQuestion ORDER BY id').all();
const runs=[];
for(let i=0;i<2;i++){
 const report=path.join(folder,`run-${i}.json`);
 const result=spawnSync(process.execPath,['node_modules/tsx/dist/cli.mjs','scripts/import-content-expansion.ts',report],{env:{...process.env,DATABASE_URL:`file:${fixture.replaceAll('\\','/')}`},encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const r=JSON.parse(fs.readFileSync(report,'utf8'));runs.push(r);
 assert.equal(r.changes.length,i===0?8:0);assert.equal(r.conflicts.length,1);assert.equal(r.already.length,i===0?0:8);
 assert.deepEqual(snapshot(),before);
 assert.deepEqual(db.prepare('SELECT id,quizId,optionsJson,correctIndex,"order" FROM QuizQuestion ORDER BY id').all(),keys);
 assert.equal(db.prepare('SELECT explanation FROM QuizQuestion WHERE id=?').get(selected.id).explanation,'Independent teacher revision — preserve this');
}
db.close();
fs.writeFileSync('docs/neuralclone-expansion-import-safety.json',JSON.stringify({checkedAt:new Date().toISOString(),fixture:path.relative('.',fixture),runs,preserved:['all non-question tables including test learner/progress/attempt/note/bookmark/study time','all question IDs, options, answer keys and order','independently edited explanation'],passed:true},null,2)+'\n');
console.log('PASS: conflict preserved, 8 updates then 0, all learner data and answer keys unchanged');
