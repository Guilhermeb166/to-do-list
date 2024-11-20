
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

  const handleDateChange = (e) => {
    let input = e.target.value;
  
    // Permitir apenas números e barras
    input = input.replace(/[^0-9/]/g, "");
  
    // Adicionar barras automaticamente no formato DD/MM/YYYY
    if (input.length === 2 || input.length === 5) {
      input += "/";
    }
  
    if (input.length > 10) {
      // Limitar o comprimento máximo para DD/MM/YYYY
      input = input.slice(0, 10);
    }
  
    // Validar formato final
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/; // Formato DD/MM/YYYY
    const match = input.match(dateRegex);
  
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
  
      if (
        day < 1 || day > 31 || // Dias válidos
        month < 1 || month > 12 || // Meses válidos
        year < 1950 || year > 2100 // Ano no intervalo permitido
      ) {
        alert("Insira um ano válido entre 1950 e 2100.");
        return;
      }
    }
  
    setDeadline(input); // Atualizar o estado com a entrada válida
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
          type="text"
          placeholder="Data Limite"
          value={deadline}
          onChange={handleDateChange}
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