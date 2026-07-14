import SweetAlert, { SweetAlertResult } from 'sweetalert2';

/** Shared SweetAlert2 baseline for advanced dialogs that need custom HTML or inputs. */
const configuredSwal = SweetAlert.mixin({
  buttonsStyling: true,
  reverseButtons: true,
  focusCancel: true,
  heightAuto: false,
  customClass: {
    popup: 'trademaster-swal-popup',
    title: 'trademaster-swal-title',
    confirmButton: 'trademaster-swal-confirm',
    cancelButton: 'trademaster-swal-cancel'
  }
});

let activeSignature = '';
let activeDialog: Promise<SweetAlertResult> | null = null;

function signature(args: unknown[]): string {
  try {
    return JSON.stringify(args, (_key, value) => typeof value === 'function' ? '[function]' : value);
  } catch {
    return String(args[0] || 'dialog');
  }
}

/**
 * Compatibility facade used by existing advanced dialogs. It keeps configuration
 * in one place and returns the active promise for repeated identical clicks.
 */
const fire = ((...args: any[]): Promise<SweetAlertResult> => {
    const nextSignature = signature(args);
    if (activeDialog && activeSignature === nextSignature && configuredSwal.isVisible()) {
      return activeDialog;
    }

    activeSignature = nextSignature;
    const dialog = (configuredSwal.fire as any)(...args) as Promise<SweetAlertResult>;
    activeDialog = dialog;
    dialog.finally(() => {
      if (activeDialog === dialog) {
        activeDialog = null;
        activeSignature = '';
      }
    });
    return dialog;
  }) as typeof configuredSwal.fire;

const Swal: Pick<typeof configuredSwal, 'fire' | 'isVisible' | 'showValidationMessage'> = {
  fire,
  isVisible: (): boolean => configuredSwal.isVisible(),
  showValidationMessage: (message: string): void => configuredSwal.showValidationMessage(message)
};

export default Swal;
