export interface HourlyForecast {
  time: string;
  temperature: number;
  precipitationProbability: number;
}

export interface Weather {
  currentTemperature: number;
  condition: string;
  precipitationProbability: number;
  hourlyForecast: HourlyForecast[];
}

export interface Meal {
  name: string;
  imageUrl: string;
  recipeUrl: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
}

export interface RomanticEvent {
  name: string;
  date: string;
  location: string;
  url: string;
  thumbnailUrl?: string;
}

export interface Reminder {
  alert: string;
  flowerUrl: string;
}

export interface Family {
  romanticEvents: RomanticEvent[];
  reminders: Reminder[];
}

export interface TechUpdate {
  headline: string;
  url: string;
  thumbnailUrl?: string;
}

export interface WorldEvent {
  headline: string;
  url: string;
  thumbnailUrl: string;
}

export interface LocalEvent {
  name: string;
  date: string;
  location: string;
  url: string;
  thumbnailUrl?: string;
}

export interface SchoolEvent {
  name: string;
  date: string;
  url: string;
  thumbnailUrl?: string;
}

export interface Quote {
  text: string;
  character: string;
  imageUrl: string;
}

export interface DigestData {
  weather: Weather;
  meals: Meal[];
  family: Family;
  techUpdates: TechUpdate[];
  worldEvents: WorldEvent[];
  localEvents: LocalEvent[];
  schoolEvents: SchoolEvent[];
  financials: any;
  quote: Quote;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}
