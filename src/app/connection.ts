import { toast } from '../lib/notify';
import { useTali } from '../store/useTali';

/** Simulated, like the prototype: flips the flag; nothing is actually sent or cached. */
export function toggleConnection() {
  const online = useTali.getState().toggleOnline();
  if (online) toast('Back online · queue synced');
  else toast('Offline · POS keeps working, orders will sync when back', 'yellow');
}
