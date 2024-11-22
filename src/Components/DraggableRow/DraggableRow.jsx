import{ useRef,useState } from "react";
import { useDrag, useDrop } from "react-dnd"; //Hooks da biblioteca react-dnd, que ajudam a implementar o arrastar e soltar ("drag-and-drop") de elementos na tela.
import styles from './DraggableRow.module.css'
import { MdEdit } from "react-icons/md";
import { IoTrashBin } from "react-icons/io5";
import DeleteConfirmation from "../DeleteConfirmation/DeleteConfirmation";

export default function DraggableRow({
  task,//Um objeto que contém as informações da tarefa,
  index,// A posição da tarefa na lista, usada para controlar a ordem.
  moveTask,//Uma função que move a tarefa de uma posição para outra na lista.
  setTaskToEdit,//Função que permite selecionar uma tarefa para edição.
  setShowModal,//Função que controla a exibição de um modal (caixa de diálogo) para editar uma tarefa.
  handleDelete,//Função que deleta uma tarefa.
}) {

  const ref = useRef(null);
  
  const [showDeleteWindow,setShowDeleteWindow] = useState(false)
  

  const [, drop] = useDrop({//Configura a área onde o item pode ser "solto" 
    accept: "TASK",// este componente aceita apenas itens do tipo "TASK" (neste caso, as tarefas).
    hover(item, info) {// Função que é chamada quando o item está sendo arrastado sobre esta linha
      if (!ref.current) return;
      const dragIndex = item.index;//Posição original do item sendo arrastado.
      const hoverIndex = index;//Posição da linha atual onde o item está sendo arrastado.
      if (dragIndex === hoverIndex) return;
      moveTask(dragIndex, hoverIndex);//Muda a posição da tarefa na lista.
      item.index = hoverIndex;// Atualiza o índice da tarefa para a nova posição.
    },
  });

  const [{ isDragging }, drag] = useDrag({//Configura o comportamento de arrastar este componente
    type: "TASK",
    item: { type: "TASK", index },//Objeto que representa os dados do item sendo arrastado (neste caso, o índice da tarefa).
    collect: (info) => ({//Função que coleta informações sobre o estado do arrasto
      isDragging: info.isDragging(),// Retorna true enquanto o item está sendo arrastado, o que ajuda a controlar a aparência visual.
    }),
  });

  drag(drop(ref));//Combina as funcionalidades de arrastar (drag) e soltar (drop) com a linha referenciada (ref). Assim, a linha pode ser arrastada e solta em outra posição.

   // Função para confirmar exclusão
   const confirmDelete = () => {
    handleDelete(task.id);
    setShowDeleteWindow(false);
  };

  // Função para cancelar exclusão
  const cancelDelete = () => {
    setShowDeleteWindow(false);
  };

  

  return (
    <>
    <tr
      ref={ref}
      className={styles.line}
      style={{
        opacity: isDragging ? 0.2 : 1,
        backgroundColor: task.cost >= 1000 ? "yellow" : "transparent",
      }}
    >
      <td>{task.id}</td>
      <td>{task.name}</td>
      <td>{task.cost !== undefined && task.cost !== null ? `R$ ${task.cost.toFixed(2)}` : ""}</td>
      <td>{task.deadline}</td>
      <td >
        <div className={styles.actions}> 
            <button
              onClick={() => {
                setTaskToEdit(task);
                setShowModal(true);
              }}
              className={styles.iconsActions}
              style={{color:'#ff6600'}}
            >
              <MdEdit className={styles.icons}/>
            </button>
            <button onClick={() => setShowDeleteWindow(true)} className={styles.iconsActions}><IoTrashBin className={styles.icons} style={{color:'red'}}/></button>
        </div>
      </td>
    </tr>
    {/* Renderiza o modal de confirmação de exclusão */}
    {showDeleteWindow && (
        <DeleteConfirmation
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}