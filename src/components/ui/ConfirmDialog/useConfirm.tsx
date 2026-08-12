import { useCallback, useState } from 'react'
import { Dialog, Modal, ModalOverlay } from 'react-aria-components'
import { Button } from '../Button'
import styles from './ConfirmDialog.module.css'

interface Request {
  message: string
  confirmLabel: string
  resolve: (confirmed: boolean) => void
}

/**
 * An in-panel replacement for ExtendScript's `confirm()`, which freezes After
 * Effects until answered. Keeps the `await confirm(...)` shape at call sites.
 *
 * Render the returned `dialog` somewhere in the component that owns the hook.
 */
export function useConfirm() {
  const [request, setRequest] = useState<Request | null>(null)

  const confirm = useCallback(
    (message: string, confirmLabel = 'Confirm'): Promise<boolean> =>
      new Promise((resolve) => setRequest({ message, confirmLabel, resolve })),
    [],
  )

  const answer = useCallback(
    (confirmed: boolean) => {
      setRequest((current) => {
        current?.resolve(confirmed)
        return null
      })
    },
    [],
  )

  const dialog = request ? (
    <ModalOverlay
      className={styles.overlay}
      isDismissable
      isOpen
      onOpenChange={(isOpen) => {
        // Dismissing without choosing is a "no".
        if (!isOpen) answer(false)
      }}
    >
      <Modal className={styles.modal}>
        <Dialog className={styles.dialog} role="alertdialog" aria-label={request.message}>
          <p className={styles.message}>{request.message}</p>
          <div className={styles.actions}>
            <Button onPress={() => answer(false)}>Cancel</Button>
            <Button variant="key" onPress={() => answer(true)} autoFocus>
              {request.confirmLabel}
            </Button>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  ) : null

  return { confirm, dialog }
}
