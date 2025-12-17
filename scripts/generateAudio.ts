import 'dotenv/config';

import { randomUUID } from 'crypto';
import fs from 'fs/promises';

import minimist from 'minimist';
import ora, { Ora } from 'ora';
import pc from 'picocolors';
import prettyBytes from 'pretty-bytes';
import prettyMilliseconds from 'pretty-ms';

import { createAudio, getLastStory, getStoryById } from '@/db/queries';
import { generateAudioGoogle } from '@/lib/tts';
import { getLanguage } from '@/lib/utils';

import {
  defaultGoogleTtsModelName,
  defaultGoogleTtsVoice,
  supportedLanguages,
  ttsPrompts,
} from '@/config';

import { Story } from '@/types';

// properly parse args passed after '--' from npm script
const rawArgs = process.argv.slice(2);
const separatorIndex = rawArgs.indexOf('--');
const processedArgs =
  separatorIndex >= 0
    ? [...rawArgs.slice(0, separatorIndex), ...rawArgs.slice(separatorIndex + 1)]
    : rawArgs;

const args = minimist(processedArgs, {
  string: ['storyId', 'languageCode', 'model', 'prompt', 'voice'],
  boolean: ['help', 'last', 'defaults', 'test'],
  alias: {
    defaults: 'D',
    help: 'h',
    languageCode: 'L',
    last: 'l',
    model: 'm',
    prompt: 'p',
    storyId: 's',
    test: 'T',
    voice: 'v',
  },
  default: {
    voice: defaultGoogleTtsVoice,
    model: defaultGoogleTtsModelName,
    prompt: 'default',
  },
});

function showHelp() {
  console.log('Generate audio from story\n');
  console.log('Options:\n');
  console.log('  -s, --storyId <id>        ID of the story to generate audio for');
  console.log('  -l, --last                Generate audio for the most recent story');
  console.log('  -L, --languageCode <code> Language code for TTS (e.g., en-US, es-ES)');
  console.log('  -v, --voice <voice>       Voice name to use for TTS');
  console.log('  -m, --model <model>       TTS Model to use');
  console.log(
    '  -p, --prompt <prompt>     Prompt variant to use for TTS (one of: ' +
      Object.keys(ttsPrompts).join(', ') +
      ')'
  );
  console.log('  -D, --defaults            Show default values for model/voice');
  console.log('  -T, --test                Run in test mode (no output file will be saved)');
  console.log('  -h, --help                Show this help message');
  console.log();
  console.log('Defaults:\n');

  showDefaults();

  process.exit(0);
}

function showDefaults() {
  console.log('Voice:', pc.cyan(defaultGoogleTtsVoice));
  console.log('Model:', pc.cyan(defaultGoogleTtsModelName));
}

(async () => {
  let spinner: Ora | null = null;

  if (args.defaults) {
    showDefaults();

    process.exit(0);
  }

  if (args.help || (!args.storyId && !args.last)) {
    showHelp();

    process.exit(0);
  }

  if (!args.prompt) {
    console.error(
      `${pc.red('Error')}: Unknown prompt: ${args.prompt}. Must be one of: ${Object.keys(
        ttsPrompts
      ).join(', ')}`
    );

    process.exit(1);
  }

  spinner = ora(`Looking up story ID ${pc.magenta(args.storyId)}`).start();

  let story: Story | null = null;

  if (args.storyId) {
    story = await getStoryById(args.storyId);

    if (story)
      spinner.succeed(`Found story ID ${pc.magenta(args.storyId)}: ${pc.cyan(story.title)}`);
    else {
      spinner.fail(pc.red(`Story with ID ${args.storyId} not found.`));

      process.exit(1);
    }
  } else if (args.last) {
    story = await getLastStory();

    if (story)
      spinner.succeed(
        `Found most recent story ID ${pc.magenta(story.id)}: ${pc.cyan(story.title)}`
      );
    else {
      spinner.fail(pc.red('No stories found in the database.'));

      process.exit(1);
    }
  } else {
    spinner.fail(
      pc.red('Provide a story ID using --storyId or use --last to get the most recent story.')
    );

    process.exit(1);
  }

  const languageCode = args.languageCode || story.language;
  const languageName = getLanguage({ languageCode })?.name;

  if (!supportedLanguages.find((l) => l.languageCode == languageCode)?.googleCloudTts) {
    spinner.fail(`\n${pc.red('Error')}: TTS not supported for language code '${languageCode}'.`);

    process.exit(1);
  }

  console.log();
  console.log('Language Code:', pc.cyan(languageCode));
  console.log('Voice:        ', pc.cyan(args.voice));
  console.log('Model:        ', pc.cyan(args.model));
  console.log('Prompt:       ', pc.cyan(args.prompt));
  console.log();

  if (args.test)
    console.log(pc.yellow('Running in test mode, no actual audio will be generated.\n'));

  const startTime = performance.now();
  spinner = ora(`Generating audio in ${pc.cyan(languageName)}`).start();

  const interval = setInterval(() => {
    const elapsed = prettyMilliseconds(performance.now() - startTime);

    spinner.text = `Generating audio in ${pc.cyan(languageName)} ${pc.gray(`(${elapsed})`)}`;
  }, 1000);

  const text = story.title + '\n\n' + story.story;

  const outputFilepath = `audio/audio-${randomUUID()}.mp3`;
  await fs.mkdir('audio', { recursive: true });

  try {
    const result = await generateAudioGoogle({
      languageCode,
      text,
      voice: args.voice,
      model: args.model,
      outputFilepath,
      test: args.test,
    });

    clearInterval(interval);
    const totalTimeMs = performance.now() - startTime;
    const totalTime = prettyMilliseconds(totalTimeMs);

    await createAudio({
      storyId: story.id,
      provider: 'google-cloud-gemini-tts',
      language: languageCode,
      settings: {
        voice: args.voice,
        model: args.model,
        prompt: args.prompt,
      },
      size: result.size,
      timeToGenerate: Math.round(totalTimeMs),
      filename: outputFilepath,
    });

    spinner?.succeed(
      `Audio generation completed successfully in ${pc.gray(`${totalTime}`)}: ${pc.blue(
        outputFilepath
      )} (${prettyBytes(result.size)})`
    );
  } catch (error) {
    clearInterval(interval);
    spinner?.fail(pc.red(`Audio generation failed: ${(error as Error).message}`));

    process.exit(1);
  }
})();
