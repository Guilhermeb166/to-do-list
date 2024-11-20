import { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AddItem from "../AddItem/AddItem";
import styles from "./Table.module.css";
import DraggableRow from "../DraggableRow/DraggableRow";

export default function Table() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Carregar tarefas do backend
  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tasks");
      setTasks(response.data); // Salva as tarefas com os IDs sequenciais
    } catch (error) {
      console.error("Erro ao carregar tarefas: ", error)
    }
  };

  useEffect(() => {
    fetchTasks(); // Carrega as tarefas ao iniciar o componente
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/delete-task/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id)); // Atualiza o estado local
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };
  // Função para trocar a ordem das tarefas
  const moveTask = async (dragIndex, hoverIndex) => {
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);

    // Atualizar ordem de apresentação
    updatedTasks.forEach((task, index) => {
      task.order = index + 1;
    });

    setTasks(updatedTasks);

    // Atualizar no backend
    try {
      await Promise.all(
        updatedTasks.map((task) =>
          axios.put(`http://localhost:3001/update-task/${task.id}`, {
            ...task,
          })
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar ordem das tarefas:", error);
    }
  };
  return(
  <DndProvider backend={HTML5Backend}>
  <section className={styles.container}>
    <h1>Lista de Tarefas</h1>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Custo (R$)</th>
          <th>Data Limite</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task, index) => (
          <DraggableRow
            key={task.id}
            index={index}
            task={task}
            moveTask={moveTask}
            setTaskToEdit={setTaskToEdit}
            setShowModal={setShowModal}
            handleDelete={handleDelete}
          />
        ))}
      </tbody>
    </table>
    <button
      onClick={() => setShowModal(true)}
      className={styles.AddTask}
    >
      Adicionar Tarefa
    </button>

    {showModal && (
      <AddItem
        onClose={() => {
          setShowModal(false);
          setTaskToEdit(null); // Limpa o estado da tarefa editada
        }}
        onAdd={(newTask) => {
          setTasks((prevTasks) => [...prevTasks, newTask]);
          setShowModal(false);
        }}
        onEdit={(id, updatedTask) => {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === id ? { ...task, ...updatedTask } : task
            )
          );
          setShowModal(false);
        }}
        taskToEdit={taskToEdit}
      />
    )}
  </section>
</DndProvider>
);
}