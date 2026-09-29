import { modals } from '@mantine/modals';
import { FormModal, type FormOptions } from './FormModal';

let seq = 0;

/** Opens a small modal form; replaces the prototype's prompt() / confirm() dialogs. */
export function openForm(options: FormOptions) {
  const modalId = `form-${++seq}`;
  modals.open({ modalId, title: options.title, children: <FormModal {...options} modalId={modalId} /> });
}
