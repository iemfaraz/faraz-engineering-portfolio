import {forwardRef} from 'react';
export const Textarea=forwardRef(function Textarea({className='',...props},ref){return <textarea ref={ref} className={'flex min-h-20 w-full border border-input bg-background px-3 py-2 text-sm '+className} {...props}/>;});
