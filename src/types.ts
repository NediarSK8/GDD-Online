export interface Mechanic {
  name: string;
  description: string;
}

export interface GddData {
  gameTitle: string;
  logline: string;
  coreMechanics: Mechanic[];
  targetAudience: string;
}
