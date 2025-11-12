export type StoryRequirement = {
  count: number;
  options: (string | number)[];
  template: string;
  label?: string;
};
export type StoryRequirements = Record<string, StoryRequirement>;
