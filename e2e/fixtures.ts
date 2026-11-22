import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import {randomUUID} from 'node:crypto';
import {SignJWT} from 'jose';
import type {BrowserContext} from '@playwright/test';
/** Seed setup data without consuming the public registration rate limit. */
export async function createUserFixture(prefix:string,password:string){
  if(!/^file:.*[/\\]ml-curriculum-e2e-[^/\\]+[/\\][^/\\]+\.db$/.test(process.env.DATABASE_URL??''))throw new Error('Test users require the isolated E2E database.');
  const db=new PrismaClient(),email=`${prefix}-${randomUUID()}@example.invalid`;
  try{await db.user.create({data:{email,passwordHash:await bcrypt.hash(password,12)}});return {email,password};}
  finally{await db.$disconnect();}
}

/** Auth setup for tests whose subject is fonts/hydration, not the login flow.
 * Keep the real endpoint quota intact; actual auth flows test it separately. */
export async function createSessionFixture(context:BrowserContext,prefix:string,password:string){
  const target=new URL(process.env.E2E_BASE_URL??'');
  const secret=process.env.SESSION_SECRET??'';
  if(process.env.NEURALCLONE_E2E!=='1'||!['127.0.0.1','localhost'].includes(target.hostname)||!target.port||target.port==='3000'||secret.length<32)throw new Error('Session fixture requires isolated E2E server and secret.');
  const fixture=await createUserFixture(prefix,password),db=new PrismaClient();
  try{
    const user=await db.user.findUniqueOrThrow({where:{email:fixture.email}});
    const token=await new SignJWT({sub:user.id,v:user.tokenVersion}).setProtectedHeader({alg:'HS256'}).setExpirationTime('1h').sign(new TextEncoder().encode(secret));
    await context.addCookies([{name:'session',value:token,url:target.origin,httpOnly:true,sameSite:'Lax',secure:false}]);
  }finally{await db.$disconnect();}
  return fixture;
}
