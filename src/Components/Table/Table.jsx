import { useEffect, useState } from "react";
import axios from "axios";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Snackbar, Alert, Grow } from "@mui/material";
import AddItem from "../AddItem/AddItem";
import styles from "./Table.module.css";
import DraggableRow from "../DraggableRow/DraggableRow";
import { AiOutlineCheckCircle, AiOutlineClose } from "react-icons/ai";
import { MdDeleteForever, MdModeEdit } from "react-icons/md";

export default function Table() {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);// Novo estado para o snackbar de exclusão
  const [deleteSnackbarMessage, setDeleteSnackbarMessage] = useState("");
  // Estado para o snackbar de edição
  const [editSnackbarOpen, setEditSnackbarOpen] = useState(false);
  const [editSnackbarMessage, setEditSnackbarMessage] = useState("");

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
         // Configuração do snackbar para a confirmação de exclusão
         setDeleteSnackbarMessage("Tarefa excluída com sucesso!");
         setDeleteSnackbarOpen(true);
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
          axios.put(`https://to-do-list-vhdd.onrender.com/update-task/${task.id}`, { ...task })
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
              // Configuração do snackbar para confirmação de adição
              setSnackbarMessage("Tarefa adicionada com sucesso!");
              setSnackbarSeverity("success"); // Verde para sucesso
              setSnackbarOpen(true);
              setShowModal(false);
            }}
            onEdit={(id, updatedTask) => {
              setTasks((prevTasks) =>
                prevTasks.map((task) =>
                  task.id === id ? { ...task, ...updatedTask } : task
                )
              );
              setEditSnackbarMessage("Tarefa editada com sucesso!");
              setEditSnackbarOpen(true);
              setShowModal(false);
            }}
            taskToEdit={taskToEdit}
          />
        )}

        {/* Snackbar para adição de tarefa */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={GrowTransition}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity={snackbarSeverity}
            sx={{ width: "100%",color:'#fff', backgroundColor: snackbarSeverity === "success" ? "#35AB54" : undefined }}
            icon={
              snackbarSeverity === "success" ? (
                <AiOutlineCheckCircle style={{ color: "#fff" }} />
              ) : (
                <AiOutlineClose style={{ color: "#fff" }} />
              )
            }
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Snackbar para exclusão de tarefa */}
        <Snackbar
          open={deleteSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setDeleteSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={GrowTransition}
        >
          <Alert
            onClose={() => setDeleteSnackbarOpen(false)}
            severity="error" // Vermelho para erro ou exclusão
            sx={{ width: "100%",color:'#fff', backgroundColor: "red" }}
            icon={<MdDeleteForever style={{ color: "#fff" }} />}
          >
            {deleteSnackbarMessage}
          </Alert>
        </Snackbar>
         {/* Snackbar para edição de tarefa */}
         <Snackbar
          open={editSnackbarOpen}
          autoHideDuration={3000}
          onClose={() => setEditSnackbarOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={GrowTransition}
        >
          <Alert
            onClose={() => setEditSnackbarOpen(false)}
            severity="info"
            sx={{ width: "100%", color: "#fff", backgroundColor: "#FFA50f" }} // Cor laranja
            icon={<MdModeEdit style={{ color: "#fff" }} />}
          >
            {editSnackbarMessage}
          </Alert>
        </Snackbar>
      </section>
    </DndProvider>
  );
}
