import {forwardRef} from 'react';
export const Image=forwardRef(function Image({fittingType,originWidth,originHeight,focalPointX,focalPointY,quality,...props},ref){return <img ref={ref} {...props}/>;});
