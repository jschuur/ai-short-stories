// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'ai-short-stories',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
    };
  },
  async run() {
    const { env } = await import('./src/env');

    console.log('hostname: ', env.SITE_HOSTNAME);

    new sst.aws.Nextjs('Site', {
      domain: env.SITE_HOSTNAME,
      server: {
        timeout: '60 seconds',
      },
    });
  },
});
