import {forwardRef} from 'react';
export const Input=forwardRef(function Input({className='',...props},ref){return <input ref={ref} className={'flex h-10 w-full border border-input bg-background px-3 py-2 text-sm '+className} {...props}/>;});
