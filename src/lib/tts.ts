import { promises as fs, statSync } from 'fs';

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

import { defaultGoogleTtsModelName, defaultGoogleTtsVoice, ttsPrompts } from '@/config';
import { sleep } from '@/lib/utils';

import { env } from '@/env';

export type GoogleCloudTTSOptions = {
  prompt?: string;
  text: string;
  languageCode?: string;
  voice?: string;
  model?: string;
  outputFilepath: string;
  test?: boolean;
};
export async function generateAudioGoogle({
  prompt = ttsPrompts.default,
  text,
  languageCode = 'en-US',
  voice = defaultGoogleTtsVoice,
  model = defaultGoogleTtsModelName,
  outputFilepath,
  test,
}: GoogleCloudTTSOptions): Promise<{ size: number }> {
  if (test) {
    await sleep(3000);

    return { size: 12345678 };
  }

  if (
    !env.GOOGLE_CLOUD_PROJECT_ID ||
    !env.GOOGLE_CLOUD_PRIVATE_KEY ||
    !env.GOOGLE_CLOUD_CLIENT_EMAIL
  )
    throw new Error(
      'Google credentials for TTS not set (GOOGLE_CLOUD_PROJECT_ID, GOOGLE_CLOUD_PRIVATE_KEY, GOOGLE_CLOUD_CLIENT_EMAIL)'
    );

  const clientConfig: {
    projectId: string;
    keyFilename?: string;
    credentials?: {
      client_email: string;
      private_key: string;
    };
  } = {
    projectId: env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: {
      client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: env.GOOGLE_CLOUD_PRIVATE_KEY,
    },
  };

  const client = new TextToSpeechClient(clientConfig);

  const [response] = await client.synthesizeSpeech({
    input: {
      text,
      prompt,
    },
    voice: {
      languageCode,
      name: voice,
      modelName: model,
    },
    audioConfig: {
      audioEncoding: 'MP3',
    },
  });

  if (!response.audioContent) throw new Error('No audio content received from TTS API');

  await fs.writeFile(outputFilepath, Buffer.from(response.audioContent), 'binary');

  const size = statSync(outputFilepath).size;

  console.log(`Audio content written to file: ${outputFilepath}`);

  return { size };
}
