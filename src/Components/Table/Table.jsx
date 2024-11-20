import { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Snackbar, Alert, Grow } from "@mui/material";
import AddItem from "../AddItem/AddItem";
import styles from "./Table.module.css";
import DraggableRow from "../DraggableRow/DraggableRow";

export default function Table() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Carregar tarefas do backend
  const fetchTasks = async () => {
    try {
      // Altere a URL para o endpoint correto do seu backend
      const response = await axios.get("https://to-do-list-vhdd.onrender.com/tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Erro ao carregar tarefas: ", error);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, []); // Este useEffect garante que a função seja chamada apenas uma vez quando o componente é montado.

  function GrowTransition(props) {
    return <Grow {...props} />;
  }
  const handleDelete = async (id) => {
    try {
     // await axios.delete(`http://localhost:3001/delete-task/${id}`);
      await axios.delete(`https://to-do-list-vhdd.onrender.com/delete-task/${id}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
    }
  };

  const moveTask = async (dragIndex, hoverIndex) => {
    const updatedTasks = [...tasks];
    const [draggedTask] = updatedTasks.splice(dragIndex, 1);
    updatedTasks.splice(hoverIndex, 0, draggedTask);

    updatedTasks.forEach((task, index) => {
      task.order = index + 1;
    });

    setTasks(updatedTasks);

    try {
      await Promise.all(
        updatedTasks.map((task) =>
          axios.put(`http://localhost:3001/update-task/${task.id}`, { ...task })
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar ordem das tarefas:", error);
    }
  };

  return (
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
              setTaskToEdit(null);
            }}
            onAdd={(newTask) => {
              setTasks((prevTasks) => [...prevTasks, newTask]);
              setSnackbarMessage("Tarefa adicionada com sucesso!");
              setSnackbarOpen(true);
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

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={GrowTransition}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </section>
    </DndProvider>
  );
}
