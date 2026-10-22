export type Conditions = 'clear' | 'cloud' | 'rain' | 'snow' | 'storm';
export const palettes: Record<string,string> = {
  'clear-day':'#8b8151',
  'clear-night':'#53673e',
  'cloud-day':'#768578',
  'cloud-night':'#536b60',
  'rain-day':'#5c8199',
  'rain-night':'#426781',
  'snow-day':'#91a8bd',
  'snow-night':'#627f9f',
  'storm-day':'#837297',
  'storm-night':'#725989',
};
export function conditions(code:number):Conditions {
  if(code>=95) return 'storm';
  if([71,73,75,77,85,86].includes(code)) return 'snow';
  if(code>=51) return 'rain';
  if(code>=2) return 'cloud';
  return 'clear';
}
export function localDay(now = new Date()) { return now.getHours()>=7 && now.getHours()<19; }
export function daylight(now:number, sunrise:number[], sunset:number[], fallback:boolean) {
  for(let i=0;i<sunrise.length;i++) {
    if(now>=sunrise[i]-43200 && now<sunset[i]+21600) return now>=sunrise[i] && now<sunset[i];
  }
  return fallback;
}
