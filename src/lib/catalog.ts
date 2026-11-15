import type { Lesson, TutorialCard } from "@/lib/types";

export type CatalogTutorial = TutorialCard & { lesson: Lesson };

const lesson = (
  chapters: Lesson["chapters"],
  exercises: Lesson["exercises"],
): Lesson => ({ chapters, exercises });

export const CATALOG_VERSION = 5;

export const CATALOG: CatalogTutorial[] = [
  {
    id: "free-video",
    title: "Free Video Generation",
    description: "Make a realistic 50-second video in Google Flow on a free account, with the same face and a natural voice.",
    difficulty: "Start",
    durationMin: 7,
    thumbnail: "/covers/free-video.jpg",
    reel: "/reels/free-video.mp4",
    muxPlaybackId: "",
    tags: ["Google Flow", "Video"],
    sortOrder: -1,
    lesson: lesson(
      [
        {
          id: "c1",
          title: "Open Google Flow on a free account",
          minutes: 1,
          body: "Go to labs.google/fx/tools/flow and sign in with a normal Gmail account. You do not need a paid plan to start. Create a new project so you land in the workspace where prompts, the model, settings, and generated clips live. The point of this lesson is one finished video, not a tour of every button.",
        },
        {
          id: "c2",
          title: "Spend the 50 daily credits on purpose",
          minutes: 1,
          body: "Free accounts get 50 generation credits a day. Those are not 50 videos. Omni Flash at 360p costs about 1 credit per second, so five 10-second clips use the whole day and give you 50 seconds. At 720p the same model costs about 3 credits per second, which is only about 16 seconds. Veo 3.1 Lite can stretch 50 credits to about 40 seconds at 720p. For a first complete piece, stay on Omni Flash at 360p, 16:9, 10 seconds, and one output. Get the character and the voice right before you spend credits on resolution.",
        },
        {
          id: "c3",
          title: "Lock one character with a reference",
          minutes: 1,
          body: "Do not ask for 'a guy talking to a camera'. Name who they are, what they wear, the light, and the shot. Example: a photorealistic cinematic medium shot of a friendly Filipino male technology presenter in his early thirties, dark navy polo, natural skin, professional studio light. When that still looks right, reuse it as an ingredient, a reference image, on every new clip. Text alone will change the face. The five scenes for a 50-second piece: welcome in a studio, stand beside a monitor, work at a laptop, explain a tool, then close.",
        },
        {
          id: "c4",
          title: "Keep one human voice",
          minutes: 1,
          body: "Under ingredients, open Voices. Pick one voice or describe one style and reuse it: one male speaker, warm conversational voice, relaxed Filipino English, natural pauses, realistic breathing, no exaggerated acting. A consistent generated voice is not a clone of a real person. Keep each line short. Listen before you generate the next scene. If it sounds like a script being read, shorten the line and ask for a pause.",
        },
        {
          id: "c5",
          title: "Generate five clips, then cut them",
          minutes: 2,
          body: "For each scene: 16:9, 10 seconds, the same character reference, the same voice, one output. Check the credit cost before you click Generate. Plan the fifty seconds as introduction, explanation, demonstration, example, then conclusion. Download the five clips and arrange them in a normal editor. Trim the dead air, match the volume, and cut so the joins feel like one video. Flow makes the clips. The editor makes the piece.",
        },
        {
          id: "c6",
          title: "Fix the usual misses",
          minutes: 1,
          body: "If the face, clothes, or hands drift, do not generate a fresh person. Put the reference image back on, tighten the prompt, and try again. Extra fingers, a new shirt, and a different jaw are rejects, not 'close enough'. Changing the model mid-sequence also breaks the look. Stay on Omni Flash 360p until all five clips belong to the same person.",
        },
      ],
      [
        { id: "e1", prompt: "Write the character line you will paste into every Google Flow clip.", hint: "Age, clothes, light, shot. Same words each time." },
        { id: "e2", prompt: "Say how many 10-second 360p clips 50 credits can buy, and why you will not start at 720p.", hint: "About five clips. Resolution comes after the face holds." },
        { id: "e3", prompt: "List the five scene jobs for a 50-second video, ten seconds each.", hint: "Intro, explain, demonstrate, example, close." },
      ],
    ),
  },
];
