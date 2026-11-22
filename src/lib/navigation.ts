import type {IconName} from '@/components/Icon';
export type NavigationLink={href:string;title:string;icon:IconName};
export const navigationLinks:readonly NavigationLink[]=[
 {href:'/explore',title:'Khám phá AI',icon:'layers'},
 {href:'/courses',title:'Lộ trình',icon:'book'},
 {href:'/playground',title:'Playground',icon:'layers'},
 {href:'/lab',title:'Code Lab',icon:'code'},
 {href:'/projects',title:'Dự án',icon:'grid'},
 {href:'/datasets',title:'Dữ liệu',icon:'layers'},
 {href:'/resources',title:'Tài liệu',icon:'book'},
];
