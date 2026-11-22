import fs from 'node:fs';
import path from 'node:path';
import MarkdownContent from './MarkdownContent';
import ExperimentLoader, {type ExperimentKind} from './ExperimentLoader';
// Only this allowlist can embed an experiment; Markdown never evaluates code.
export default function LessonBody({text}:{text:string}){
 const pieces=text.split(/^```neuralclone\r?\n(derivative|linear|descent|backprop|loss|logistic|activation|vectors|moments|bayes|softmax)\r?\n```\r?$/m);
 return <>{pieces.map((piece,i)=>i%2?<ExperimentLoader key={i} kind={piece as ExperimentKind}
  pythonPath={['vectors','moments','bayes','softmax'].includes(piece)?'/examples/foundation_math.py':undefined}
  source={fs.readFileSync(path.join(process.cwd(),'src/lib',['vectors','moments','bayes','softmax'].includes(piece)?'foundationMath.ts':'learningMath.ts'),'utf8')}
  python={fs.readFileSync(path.join(process.cwd(),'public/examples',['vectors','moments','bayes','softmax'].includes(piece)?'foundation_math.py':'learning_math.py'),'utf8')}/>:<MarkdownContent key={i}>{piece}</MarkdownContent>)}</>;
}
