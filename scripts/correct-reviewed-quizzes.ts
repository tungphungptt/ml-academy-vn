import fs from 'node:fs';import path from 'node:path';import {PrismaClient} from '@prisma/client';
async function main(){
 if(fs.existsSync('.env'))process.loadEnvFile('.env');
 const changes=[
  {slug:'cnn-practice',index:1,prompt:'Kết luận phù hợp với kết quả bộ lọc tay trong bài là gì?',answer:'Bộ lọc tay chưa thắng pixel trong split này; chưa thể kết luận cho CNN học được hoặc dữ liệu khác.',explanation:'Một phép so sánh trên một split không xác định nguyên nhân và không chứng minh tích chập luôn kém hơn.'},
  {slug:'text-classification',index:0,answer:'Tập minh họa quá nhỏ và chưa có đánh giá độc lập đại diện.',explanation:'Probability gần 0.5 không tự chứng minh đoán ngẫu nhiên. Cần dữ liệu đánh giá độc lập và metric đã định nghĩa.'},
  {slug:'text-classification',index:1,answer:'Không biểu diễn trực tiếp cụm hoặc phạm vi phủ định.',explanation:'TF-IDF unigram có thể có cả feature không và thích; nó không biểu diễn trực tiếp quan hệ giữa chúng như một cụm. N-gram chỉ hỗ trợ một phần phủ định cục bộ.'}
 ];
 const db=new PrismaClient();let updated=0,already=0,conflicts=0;
 try{
  const file=(await db.$queryRawUnsafe<{name:string;file:string}[]>('PRAGMA database_list')).find(x=>x.name==='main')!.file;
  const relative=path.relative(process.cwd(),fs.realpathSync(file));if(relative.startsWith('..')||path.isAbsolute(relative))throw Error('Database outside project');
  fs.mkdirSync('.local/backups',{recursive:true});await db.$executeRawUnsafe('VACUUM INTO ?',path.resolve('.local/backups',`quiz-review-${Date.now()}.db`));
  for(const change of changes){
   const name=`content/quizzes/${change.slug}.json`,all=JSON.parse(fs.readFileSync(name,'utf8')),before=all[change.index];
   const after={...before,prompt:change.prompt??before.prompt,options:before.options.map((v:string,i:number)=>i===before.correct?change.answer:v),explanation:change.explanation};
   await db.$transaction(async tx=>{
    const questions=await tx.quizQuestion.findMany({where:{quiz:{lesson:{slug:change.slug}}},orderBy:{order:'asc'}}),q=questions[change.index];
    const current=q&&{prompt:q.prompt,options:JSON.parse(q.optionsJson),correct:q.correctIndex,explanation:q.explanation};
    if(JSON.stringify(current)===JSON.stringify(after)){already++;return;}
    if(JSON.stringify(current)!==JSON.stringify(before)){conflicts++;return;}
    await tx.quizQuestion.update({where:{id:q.id},data:{prompt:after.prompt,optionsJson:JSON.stringify(after.options),explanation:after.explanation}});updated++;
   });all[change.index]=after;fs.writeFileSync(name,JSON.stringify(all,null,2)+'\n');
  }console.log({updated,already,conflicts});
 }finally{await db.$disconnect();}
}main().catch(e=>{console.error(e);process.exitCode=1;});
