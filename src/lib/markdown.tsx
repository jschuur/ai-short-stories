import type { Components } from 'react-markdown';

export const markdownComponents: Components = {
  h1: ({ ...props }) => <h1 className='text-2xl font-bold my-2' {...props} />,
};
