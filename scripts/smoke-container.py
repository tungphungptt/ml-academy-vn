"""Test only a disposable local Docker volume; never connects to production."""
import os
import secrets
import subprocess
import sys
import time

image = sys.argv[1] if len(sys.argv) > 1 else "ml-academy-vn-local-check"
name = "ml-academy-smoke-" + secrets.token_hex(6)
volume = name + "-data"
env = {**os.environ, "SESSION_SECRET": secrets.token_hex(32)}


def docker(*args, input=None):
    return subprocess.run(["docker", *args], input=input, text=True, env=env,
                          capture_output=True, check=True).stdout


def start():
    docker("run", "-d", "--name", name, "--mount", f"type=volume,src={volume},dst=/data",
           "-e", "SESSION_SECRET", "-e", "COOKIE_SECURE=true",
           "-e", "DATABASE_URL=file:/data/app.db", "-e", "LESSON_CONTENT_DIR=/data/lesson-overrides", image)
    for _ in range(120):
        try:
            docker("exec", name, "node", "-e",
                   "fetch('http://127.0.0.1:3000/api/health').then(async r=>{if(r.status!==200 || !(await r.json()).ok)process.exit(1)}).catch(()=>process.exit(1))")
            return
        except subprocess.CalledProcessError:
            time.sleep(0.5)
    raise RuntimeError("Container readiness failed\n" + docker("logs", name))


setup = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash,randomBytes} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
const db=new PrismaClient(), base='http://127.0.0.1:3000';
const req=(route,body,cookie)=>fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
try {
  assert.equal((await fetch(base+'/api/admin/content?file=gradient-descent.md')).status,403);
  const cross=await fetch(base+'/api/register',{method:'POST',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:'{}'});
  assert.equal(cross.status,403);
  assert.equal(await db.user.count(),0,'No default admin/users may be created');
  const email='container-smoke@example.invalid', password=randomBytes(24).toString('hex');
  const registered=await req('/api/register',{email,password}); assert.equal(registered.status,200);
  const setCookie=registered.headers.get('set-cookie')||'';
  assert.ok(/;\s*Secure/i.test(setCookie),'Production session cookie must be Secure');
  const cookie=setCookie.split(';')[0];
  const forbidden=await fetch(base+'/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({file:'gradient-descent.md',text:'# Forbidden'})});
  assert.equal(forbidden.status,403);
  const lesson=await db.lesson.findUniqueOrThrow({where:{slug:'gradient-descent'},include:{quiz:{include:{questions:true}}}});
  assert.equal((await req('/api/progress',{lessonId:lesson.id,done:true},cookie)).status,200);
  assert.equal((await req('/api/note',{lessonId:lesson.id,body:'Persistent smoke note'},cookie)).status,200);
  assert.equal((await req('/api/quiz',{quizId:lesson.quiz.id,answers:Object.fromEntries(lesson.quiz.questions.map(q=>[q.id,0]))},cookie)).status,200);
  const adminEmail='explicit-test-admin@example.invalid';
  await db.user.create({data:{email:adminEmail,passwordHash:await bcrypt.hash(password,12),role:'ADMIN'}});
  const login=await req('/api/login',{email:adminEmail,password}); assert.equal(login.status,200);
  const adminCookie=login.headers.get('set-cookie').split(';')[0];
  const edited=await fetch(base+'/api/admin/content',{method:'PUT',headers:{'Content-Type':'application/json',Cookie:adminCookie},body:JSON.stringify({file:'gradient-descent.md',text:'# Durable lesson\n\nPersistentContainerMarker'})});
  assert.equal(edited.status,200);
  assert.ok((await (await fetch(base+'/learn/gradient-descent')).text()).includes('PersistentContainerMarker'));
  assert.ok((await (await fetch(base+'/search?q=PersistentContainerMarker')).text()).includes('/learn/gradient-descent'));
  const resource=await db.resource.findFirstOrThrow();
  await db.resource.update({where:{id:resource.id},data:{title:'Resource edited in smoke test'}});
  const databases=await db.$queryRawUnsafe('PRAGMA database_list');
  assert.equal(databases.find(x=>x.name==='main').file,'/data/app.db');
  await db.$disconnect();
  fs.writeFileSync('/data/smoke-state.json',JSON.stringify({resourceId:resource.id,dbHash:createHash('sha256').update(fs.readFileSync('/data/app.db')).digest('hex')}));
  console.log('PASS: HTTP health, registration, Secure cookies, access control, progress, notes, quiz, admin edit/search, SQLite path /data/app.db');
} finally {await db.$disconnect()}
'''

verify = r'''
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
const state=JSON.parse(fs.readFileSync('/data/smoke-state.json','utf8'));
assert.equal(createHash('sha256').update(fs.readFileSync('/data/app.db')).digest('hex'),state.dbHash,'Restart must not change the database');
const db=new PrismaClient();
try {
  assert.equal(await db.user.count(),2);
  assert.equal(await db.lessonProgress.count(),1);
  assert.equal(await db.quizAttempt.count(),1);
  assert.equal((await db.note.findFirstOrThrow()).body,'Persistent smoke note');
  assert.equal((await db.resource.findUniqueOrThrow({where:{id:state.resourceId}})).title,'Resource edited in smoke test');
  assert.ok(fs.readFileSync('/data/lesson-overrides/gradient-descent.md','utf8').includes('PersistentContainerMarker'));
  const page=await fetch('http://127.0.0.1:3000/learn/gradient-descent'); assert.equal(page.status,200);
  assert.ok((await page.text()).includes('PersistentContainerMarker'));
  assert.equal((await fetch('http://127.0.0.1:3000/learn/linear-regression')).status,200);
  console.log('PASS: recreated container retains users, progress, quiz, notes, admin edits, unchanged DB bytes and bundled lessons');
} finally {await db.$disconnect()}
'''

try:
    docker("volume", "create", volume)
    start()
    print(docker("exec", "-i", name, "node", "--input-type=module", input=setup), end="", flush=True)
    docker("stop", name)
    docker("rm", name)
    start()
    print(docker("exec", "-i", name, "node", "--input-type=module", input=verify), end="", flush=True)
    assert "no migrations or seed performed" in docker("logs", name)
    print("PASS: Docker startup/recreation smoke test; disposable volume will be removed", flush=True)
except subprocess.CalledProcessError as error:
    print(error.stdout, error.stderr, file=sys.stderr)
    raise
finally:
    subprocess.run(["docker", "rm", "-f", name], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    subprocess.run(["docker", "volume", "rm", volume], env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
