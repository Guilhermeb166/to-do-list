
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./AddItem.module.css";

export default function AddItem({ onClose, onAdd, taskToEdit, onEdit }) {
  const [task, setTask] = useState("");
  const [cost, setCost] = useState("");
  const [deadline, setDeadline] = useState("");

  // Preencher os campos caso seja edição
  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.name);
      setCost(taskToEdit.cost.toString());
      setDeadline(taskToEdit.deadline);
    }
  }, [taskToEdit]);

  const handleAddTask = async () => {
    
    try {
      const response = await axios.post("http://localhost:3001/add-task", {
        name: task,
        cost: parseFloat(cost),
        deadline,
      });
      onAdd(response.data); // Atualiza a lista de tarefas no Table
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleSave = async () => {
    if (taskToEdit) {
      // Edição
      try {
        const updatedTask = {
          name: task,
          cost: parseFloat(cost),
          deadline,
        };

        // Verificar se o nome da tarefa já existe
        const response = await axios.get("http://localhost:3001/tasks");
        const taskExists = response.data.some(
          (t) => t.name === task && t.id !== taskToEdit.id
        );

        if (taskExists) {
          alert("O nome da tarefa já existe!");
          return;
        }

        // Atualizar no backend
        await axios.put(`http://localhost:3001/update-task/${taskToEdit.id}`, updatedTask);

        // Atualizar a lista no componente pai
        onEdit(taskToEdit.id, updatedTask);

        onClose(); // Fecha o modal
      } catch (error) {
        console.error("Erro ao editar tarefa:", error);
      }
    } else {
      // Adição
      await handleAddTask();
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modalContent}>
        <h2>{taskToEdit ? "Editar Tarefa" : "Adicionar Nova Tarefa"}</h2>
        <input
          type="text"
          placeholder="Nome da Tarefa"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          type="number"
          placeholder="Custo (R$)"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
        />
        <input
          type="date"
          placeholder="Data Limite"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
        <div className={styles.modalActions}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={handleSave}>
            {taskToEdit ? "Salvar Alterações" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}