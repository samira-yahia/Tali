export const money = (n: number) => `EGP ${n.toFixed(2)}`;
export const whole = (n: number) => Math.round(n).toLocaleString();

export const minutesSince = (t: number, now = Date.now()) => Math.round((now - t) / 60000);

export function ago(t: number, now = Date.now()) {
  const m = Math.max(1, minutesSince(t, now));
  return m < 60 ? `${m} min ago` : `${Math.round(m / 60)} h ago`;
}

export const clock = (t: number) =>
  new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const initials = (name: string) =>
  name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
