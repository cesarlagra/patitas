document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const chat = document.querySelector("#chat");
  const typing = document.querySelector("#typing");
  const form = document.querySelector("form");
  const nameInput = document.querySelector("#name");
  const messageInput = document.querySelector("#message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value || 'Anónimo';
    const message = messageInput.value;

    socket.emit("chat message", { name, message });
    socket.emit("stopTyping", name);

    messageInput.value = '';
  });

  messageInput.addEventListener("input", () => {
    const name = nameInput.value || 'Anónimo';

    if (messageInput.value === "") {
      socket.emit("stopTyping", name);
    } else {
      socket.emit("typing", name);
    }
  });

  socket.on("connect", () => {
    console.log("Conectado al servidor", socket.id);

    socket.on("chat message", (msg) => {
      const messageElement = document.createElement('p');
      messageElement.textContent = `${msg.name}: ${msg.message}`;
      chat.appendChild(messageElement);
    });

    socket.on("typing", (name) => {
      typing.innerHTML = `<p><em>${name} está escribiendo...</em></p>`;
    });

    socket.on("stopTyping", () => {
      typing.innerHTML = "";
    });

    socket.on("disconnect", () => {
      console.log("Desconectado del servidor");
    });
  });
});
