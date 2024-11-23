
import { useState, useEffect } from "react";
import axios from "axios"; //Biblioteca para fazer requisições HTTP.
import styles from "./AddItem.module.css";

export default function AddItem({ onClose, onAdd, taskToEdit, onEdit }) {
  const [task, setTask] = useState("");
  const [cost, setCost] = useState("");
  const [deadline, setDeadline] = useState("");
  const [costValue, setCostValue] = useState(
    task.cost ? task.cost.toFixed(2) : "" // Verifica se task.cost existe
  );


  // Preencher os valores do modal ao editar
  useEffect(() => {
    if (taskToEdit) {
      setTask(taskToEdit.name || "");
      setCost(taskToEdit.cost || 0); // Preenche o valor numérico
      setCostValue(
        (taskToEdit.cost || 0).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
      ); // Formata para exibição
      setDeadline(taskToEdit.deadline || "");
    }
  }, [taskToEdit]);

  const handleAddTask = async () => {
    // Verificar se a data limite está no formato correto
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!dateRegex.test(deadline)) {
      alert("Formato de data incorreto. ");
      return;
    }
     // Verifica se o nome da tarefa e a data limite foram preenchidos
    if (!task || deadline.trim() === "") {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    // Verifica se o custo foi informado ou é maior ou igual a 0
    if (cost === "") {
      alert("Por favor, informe um valor válido para o custo!");
      return;
    }
    try {//Faz uma requisição POST para adicionar a tarefa.
      const response = await axios.post("https://to-do-list-backend-gray.vercel.app/add-task", {
        name: task,
        cost, // Envia o valor numérico correto
        deadline,
      });
      onAdd(response.data); // Atualiza a lista de tarefas na tabela
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar tarefa:", error);
    }
  };

  const handleSave = async () => {
    if (taskToEdit) {//Verifica se há uma tarefa em edição
      try {
        const updatedTask = {//Cria um objeto contendo os dados atualizados da tarefa obtidos dos estados do componente.
          name: task,
          cost, // Envia o valor numérico correto
          deadline,
        };
        //Faz uma requisição GET ao backend para buscar todas as tarefas existentes.
        const response = await axios.get("https://to-do-list-backend-gray.vercel.app/tasks");
        //Verifica se já existe outra tarefa com o mesmo nome
        const taskExists = response.data.some(
          (t) => t.name === task && t.id !== taskToEdit.id
        );//O método some retorna true se encontrar um nome duplicado e false caso contrário
  
        if (taskExists) {
          alert("O nome da tarefa já existe!");
          return;
        }
        //Faz uma requisição PUT para atualizar a tarefa no backend
        await axios.put(`https://to-do-list-backend-gray.vercel.app/update-task/${taskToEdit.id}`, updatedTask);
        onEdit(taskToEdit.id, updatedTask);
        onClose();
      } catch (error) {
        console.error("Erro ao editar tarefa:", error);
      }
    } else {
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
  
  // Função para tratar mudanças no input de custo
  const handleCostChange = (event) => {
    const rawValue = event.target.value.replace(/\D/g, ""); // Remove todos os caracteres não numéricos
    if (rawValue === "") {
      setCostValue("R$ 0,00"); 
      setCost(0); // Define o valor de `cost` como 0
      return;
    }

    const numberValue = parseFloat(rawValue) / 100; // Converte o valor para número
    const formattedValue = numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

    setCostValue(formattedValue); // Atualiza o valor formatado para exibição
    setCost(numberValue); // Atualiza o valor numérico
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
          required
        />
          <input
          type="text"
          value={costValue} // Exibe o valor formatado
          onChange={handleCostChange} // Atualiza o valor enquanto digita
          className={styles.costInput}
          placeholder="R$ 0,00" // Placeholder para exibir quando vazio
          required
        />
         <input
          type="text"
          placeholder="Data Limite"
          value={deadline}
          onChange={handleDateChange}
          required
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