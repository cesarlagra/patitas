const mensajeError = document.getElementsByClassName("error")[0];

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = e.target.elements.user.value;
  const password = e.target.elements.password.value;

  try {
    const res = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user,
        password,
      }),
    });
  
    if (!res.ok) {
      mensajeError.classList.toggle("escondido", false);
      return;
    }
  
    const resJson = await res.json();
    if (resJson.redirect) {
  
      window.location.href = resJson.redirect;
    }
  } catch (error) {
    console.error("Error durante la solicitud de inicio de sesión:", error.message);
  }});
