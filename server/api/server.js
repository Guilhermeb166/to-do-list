//server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("../Firebase/FirebaseConfig"); // Importando o Firestore já configurado no arquivo externo

const app = express();
// Usar helmet para adicionar a política CSP
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://vercel.live"],
    },
  })
);
app.use(cors());
app.use(express.json());

// Configurar para ignorar propriedades undefined
db.settings({ ignoreUndefinedProperties: true });

// Rota para favicon.ico (para evitar erros no navegador)
app.get("/favicon.ico", (req, res) => res.status(204));

// Rota raiz para verificação da API
app.get("/", (req, res) => {
  res.status(200).send("API funcionando!");
});

// Adicionar uma nova tarefa
app.post("/add-task", async (req, res) => {
  try {
    const { name, cost, deadline } = req.body;

    // Obter o maior valor de 'order' no banco
    const snapshot = await db
      .collection("tasks")
      .orderBy("order", "desc")
      .limit(1)
      .get();
    const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order;

    const newTask = {
      id: maxOrder + 1, // ID sequencial
      name,
      cost: parseFloat(cost),
      deadline,
      order: maxOrder + 1, // Para ordenar as tarefas
    };

    // Adicionar nova tarefa ao Firebase
    const docRef = await db.collection("tasks").add(newTask);

    res.status(201).send({ id: docRef.id, ...newTask });
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    res.status(500).send({ error: error.message });
  }
});

// Atualizar uma tarefa
app.put("/update-task/:id", async (req, res) => {
  try {
    const { id } = req.params; // ID sequencial
    const { name, cost, deadline } = req.body;

    // Verificar duplicidade de nome
    const snapshot = await db
      .collection("tasks")
      .where("name", "==", name)
      .get();

    if (!snapshot.empty) {
      const isDuplicate = snapshot.docs.some(
        (doc) => doc.data().id !== parseInt(id)
      );

      if (isDuplicate) {
        return res
          .status(400)
          .send({ error: "Já existe uma tarefa com este nome." });
      }
    }
    // Buscar documento pelo campo 'id'
    const taskSnapshot = await db
      .collection("tasks")
      .where("id", "==", parseInt(id))
      .get();

    if (taskSnapshot.empty) {
      return res.status(404).send({ error: "Tarefa não encontrada" });
    }

    const docId = taskSnapshot.docs[0].id; // ID interno do Firebase
    await db.collection("tasks").doc(docId).update({ name, cost, deadline });

    res.status(200).send({ id, name, cost, deadline });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    res.status(500).send({ error: error.message });
  }
});

// Deletar uma tarefa
app.delete("/delete-task/:id", async (req, res) => {
  try {
    const { id } = req.params; // ID sequencial

    // Buscar documento pelo campo 'id'
    const snapshot = await db
      .collection("tasks")
      .where("id", "==", parseInt(id))
      .get();

    if (snapshot.empty) {
      return res.status(404).send({ error: "Tarefa não encontrada" });
    }

    // Apagar o documento
    const docId = snapshot.docs[0].id; // ID interno do Firestore
    await db.collection("tasks").doc(docId).delete();

    res.status(200).send({ message: "Tarefa deletada com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).send({ error: error.message });
  }
});

// Listar tarefas ordenadas por 'order'
app.get("/tasks", async (req, res) => {
  try {
    const snapshot = await db.collection("tasks").orderBy("order").get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).send(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);
    res.status(500).send({ error: error.message });
  }
});

// Exportar o aplicativo como manipulador
// Inicializar o servidor localmente (somente fora do ambiente de produção)
if (process.env.NODE_ENV !== "production") {
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

// Exportar o aplicativo para Vercel
module.exports = app;
// Iniciar o servidor
/*const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
*/
