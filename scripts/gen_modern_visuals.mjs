// Original educational SVGs; all numerical labels follow the toy examples.
import fs from 'node:fs/promises';
const C={bg:'#101923',fg:'#e2ebf4',mut:'#a6b4c4',line:'#52657a',green:'#83e8cb',orange:'#edb886',blue:'#92baff',panel:'#192838'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text=(x,y,s,color=C.fg,size=14,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const line=(x1,y1,x2,y2,color=C.line,extra='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2" ${extra}/>`;
const box=(x,y,w,h,label,color=C.green)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${C.panel}" stroke="${color}"/>`+text(x+w/2,y+h/2+5,label,color);
const arrow=(x1,y1,x2,y2)=>line(x1,y1,x2,y2,C.mut,'marker-end="url(#arrow)"');
async function save(name,title,body,caption){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(caption)}</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${C.mut}"/></marker></defs><rect width="640" height="360" rx="12" fill="${C.bg}"/><g font-family="Segoe UI,Arial,sans-serif">${text(320,30,title,C.fg,18)}${body}${text(320,337,caption,C.mut,12)}</g></svg>`;
 await fs.writeFile(`public/img/${name}.svg`,svg);
}
let body=line(70,275,570,275)+line(70,65,70,275);
const sx=x=>100+140*x,sy=y=>275-60*y;
body+=line(85,sy(2),545,sy(2),C.mut,'stroke-dasharray="5 5"');
for(const [i,y] of [1,1,3,3].entries()){
 const next=y<2?1.5:2.5;
 body+=line(sx(i),sy(2),sx(i),sy(next),C.orange,'marker-end="url(#arrow)"');
 body+=`<circle cx="${sx(i)}" cy="${sy(y)}" r="6" fill="${C.green}"/><rect x="${sx(i)-5}" y="${sy(next)-5}" width="10" height="10" fill="${C.orange}"/>`;
}
body+=text(465,64,'● y thật',C.green)+text(465,85,'■ F₁ sau một bước',C.orange)+text(465,106,'-- F₀ = 2',C.mut);
await save('gradient-boosting','Boosting: F₁ = F₀ + 0,5h',body,'Bốn mẫu tự tạo · MSE train: 1 → 0,25 · chưa đo tổng quát hóa');
body=line(85,275,570,275)+line(85,65,85,275);
for(const [i,[threshold,cost,tp,fp,fn]] of [[.3,3,3,3,0],[.5,6,2,2,1],[.7,9,1,1,2]].entries()){
 const x=150+i*170,y=275-cost*19;
 body+=`<rect x="${x-36}" y="${y}" width="72" height="${275-y}" rx="4" fill="${C.orange}"/>`+text(x,y-12,`Chi phí ${cost}`)+text(x,298,`t = ${threshold}`)+text(x,70,`TP ${tp} · FP ${fp} · FN ${fn}`,C.mut,12);
}
await save('imbalanced-learning','Cùng score, khác quyết định',body,'Dữ liệu minh họa · chi phí = FP × 1 + FN × 4');
body=box(20,105,115,65,'Token IDs')+box(178,105,115,65,'Embedding')+box(336,105,130,65,'Transformer')+box(510,105,110,65,'Logits');
body+=arrow(136,137,177,137)+arrow(294,137,335,137)+arrow(467,137,509,137);
body+=text(400,203,'Causal mask: không nhìn token tương lai',C.orange,13)+text(320,252,'Input: BOS, A, B     →     Target: A, B, EOS',C.blue,16);
await save('llm-foundations','Next-token language modeling',body,'ID không phải thứ tự ngữ nghĩa · ví dụ mô tả pipeline, không train LLM');
body=box(38,140,80,60,'x')+box(214,75,180,60,'W₀ cố định',C.blue)+box(190,205,95,55,'A: r×dᵢₙ')+box(330,205,110,55,'B: dₒᵤₜ×r')+box(520,140,80,60,'y');
body+=arrow(118,165,212,104)+arrow(118,170,188,232)+arrow(285,232,328,232)+arrow(395,104,520,165)+arrow(440,232,520,177)+text(470,215,'α/r',C.orange)+text(320,300,'y = W₀x + (α/r) B(Ax)',C.green,19);
await save('efficient-finetuning','LoRA: hai nhánh, một phép cộng',body,'Bản LoRA cơ bản · giảm tham số huấn luyện, không bỏ chi phí toàn bộ hệ thống');
body=box(20,80,135,60,'Nguồn + version')+box(215,80,120,60,'Chunk / index')+box(410,80,205,60,'ACL + retrieval',C.orange)+arrow(156,110,214,110)+arrow(336,110,408,110);
body+=box(55,220,145,60,'Câu hỏi + quyền')+box(275,220,135,60,'Context hợp lệ')+box(480,220,130,60,'LLM + nguồn')+arrow(200,250,273,250)+arrow(410,250,478,250)+arrow(510,141,345,218);
await save('rag-vector-search','RAG: tìm bằng chứng trước khi trả lời',body,'Tài liệu là dữ liệu không tin cậy · kiểm tra quyền trước khi vào context');
body=box(25,130,155,75,'Nguồn không tin cậy',C.orange)+box(230,130,150,75,'Model: đề xuất')+box(450,130,165,75,'Policy của server',C.green)+arrow(180,168,228,168)+arrow(380,168,448,168);
body+=line(420,65,420,290,C.green,'stroke-dasharray="6 5"')+text(510,90,'RANH GIỚI QUYỀN',C.green,13)+text(320,255,'Schema → authorize → quyền tối thiểu → thực thi',C.blue,15);
await save('llm-evaluation-security','Đề xuất của model không phải quyền thực thi',body,'Eval cả câu đúng/sai, từ chối, groundedness và tác dụng của tool');
body=box(25,105,120,60,'Data + schema')+box(190,105,120,60,'Experiment')+box(355,105,110,60,'Artifact')+box(510,105,110,60,'Serving')+arrow(145,135,188,135)+arrow(310,135,353,135)+arrow(465,135,508,135);
body+=box(230,235,180,55,'Monitor + review',C.orange)+arrow(565,167,410,260)+arrow(228,260,85,168)+text(320,205,'Version · split · seed · software · metric',C.blue,15);
await save('mlops-reproducibility','Vòng đời ML có thể truy vết',body,'Drift đầu vào không tự chứng minh chất lượng giảm · cần nhãn và bối cảnh');
body=text(135,85,'Nhóm A')+text(425,85,'Nhóm B');
for(const [j,{tp,fp}] of [{tp:1,fp:1},{tp:2,fp:0}].entries()){
 const x=80+j*290;
 for(let i=0;i<4;i++) body+=`<rect x="${x+(i%2)*55}" y="${115+Math.floor(i/2)*55}" width="42" height="42" rx="5" fill="${i<tp?C.green:i<tp+fp?C.orange:C.panel}" stroke="${C.line}"/>`;
 body+=text(x+50,252,'Selection = 0,5',C.mut,14)+text(x+50,280,`TPR = ${j===0?'0,5':'1,0'}`,C.green,17);
}
await save('responsible-ai','Cùng tỷ lệ chọn, khác tỷ lệ phát hiện',body,'Mỗi nhóm: 4 mẫu, 2 dương thật · xanh: TP · cam: FP · dữ liệu tự tạo');
console.log('Created eight original, static educational SVGs.');
