export interface AnimationEvent {
  eventId: string;
  t: number;
  opId: string;
  tensorIds: string[];
  equationTermIds: string[];
  chapterId: string;
  cameraCue?: string;
}
