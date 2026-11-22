import Landing from '@/components/Landing';
import {pageMetadata} from '@/lib/metadata';
export const dynamic='force-dynamic';
export const metadata=pageMetadata('Triển lãm AI tương tác','Khám phá hành trình từ dữ liệu, mô hình và quá trình học đến dự đoán. Học AI bằng tiếng Việt trên NeuralClone.','/explore',false);
export default function Explore(){return <Landing/>;}
