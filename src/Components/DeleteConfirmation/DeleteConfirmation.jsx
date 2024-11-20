import styles from './DeleteConfirmation.module.css'
export default function DeleteConfirmation ({ onConfirm, onCancel }){
    return(
        <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Tem certeza que deseja excluir esta tarefa?</h2>
        <div className={styles.modalActions}>
          <button onClick={onConfirm} className={styles.confirmButton}>Sim</button>
          <button onClick={onCancel} className={styles.cancelButton}>Não</button>
        </div>
      </div>
    </div>
    )

}