
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
      //const response = await axios.post("http://localhost:3001/add-task", 
      const response = await axios.post("https://to-do-list-vhdd.onrender.com/add-task", {
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
        //const response = await axios.get("http://localhost:3001/tasks");
        const response = await axios.get("https://to-do-list-vhdd.onrender.com/tasks");
        const taskExists = response.data.some(
          (t) => t.name === task && t.id !== taskToEdit.id
        );

        if (taskExists) {
          alert("O nome da tarefa já existe!");
          return;
        }

        // Atualizar no backend
        //await axios.put(`http://localhost:3001/update-task/${taskToEdit.id}`, updatedTask);
        await axios.put(`https://to-do-list-vhdd.onrender.com/update-task/${taskToEdit.id}`, updatedTask);

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
  
    // Corrigir automaticamente os valores de dia e mês
    const dateParts = input.split('/');
    let day = dateParts[0] || "";
    let month = dateParts[1] || "";
    let year = dateParts[2] || "";
  
    // Ajuste do dia e do mês se necessário
    if (day.length === 2) {
      if (parseInt(day, 10) > 31) day = "31";
    }
    if (month.length === 2) {
      if (parseInt(month, 10) > 12) month = "12";
    }
  
    // Formatar o input enquanto o usuário digita
    if (day.length === 2 && input.length === 2 && e.nativeEvent.inputType !== 'deleteContentBackward') {
      input = `${day}/`;
    } else if (month.length === 2 && input.length === 5 && e.nativeEvent.inputType !== 'deleteContentBackward') {
      input = `${day}/${month}/`;
    } else {
      input = `${day}${month ? '/' + month : ''}${year ? '/' + year : ''}`;
    }
  
    // Limitar o comprimento máximo para DD/MM/YYYY
    if (input.length > 10) {
      input = input.slice(0, 10);
    }
  
    // Validar o ano quando for completo
    if (year.length === 4) {
      const numericYear = parseInt(year, 10);
      if (numericYear < 1950) {
        year = "1950";
      } else if (numericYear > 2100) {
        year = "2100";
      }
      input = `${day}/${month}/${year}`;
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