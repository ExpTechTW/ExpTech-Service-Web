const password_strength = document.getElementById("password-strength");
const new_password = document.getElementById("new-password");
const repeat_password = document.getElementById("repeat-password");
const success_view = document.getElementById("success-view");
const form_view = document.getElementById("form-view");
const container = document.getElementById("container");
const submit = document.getElementById("submit");
const changeForm = document.getElementById("change");

document.getElementById("login").onclick = (e) => {
  window.location.href = "./login.html";
};

new_password.oninput = (e) => {
  this.value = new_password.value;
  password_strength.style.display = "block";

  if (this.value.match(/(?=.*[^A-Za-z0-9@_.-])/))
    return (password_strength.className = "error invalid");

  if (
    this.value.match(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{10,})/,
    )
  )
    password_strength.className = "very-strong";
  else if (this.value.match(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/))
    password_strength.className = "strong";
  else if (this.value.match(/((?=.*[a-zA-Z0-9])(?=.{6,}))/))
    password_strength.className = "medium";
  else if (this.value.length > 0) password_strength.className = "weak";
  else password_strength.className = "error empty";
};

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

if (!params.token)
  document.location.replace("./login.html");

changeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  repeat_password.setCustomValidity("");
  new_password.setCustomValidity("");

  submit.disabled = true;

  console.log("test");

  fetch("https://api.exptech.com.tw/api/v1/et/change", {
    method  : "POST",
    headers : { "Content-Type": "application/json" },
    body    : JSON.stringify({
      token    : params.token,
      new_pass : new_password.value,
    }),
  })
    .then(async (res) => {
      if (res.ok) {
        container.style.height = form_view.offsetHeight + 76;
        form_view.style.position = "absolute";
        success_view.style.position = "absolute";
        success_view.style.display = "block";
        form_view.style.opacity = 0;
        container.style.height = success_view.offsetHeight + 76;
        setTimeout(() => {
          success_view.style.position = "";
          success_view.style.opacity = 1;
          form_view.style.display = "none";
          form_view.style.position = "";
        }, 100);

        setTimeout(() => (window.location.href = "./login.html"), 5_000);
      } else {
        switch (await res.text()) {
          case "Invaild new pass!": {
            new_password.setCustomValidity("新密碼無效。");
            new_password.reportValidity();
            break;
          }

          case "New pass format error!": {
            new_password.setCustomValidity("新密碼格式錯誤。");
            new_password.reportValidity();
            break;
          }

          case "This account was not found!": {
            new_password.setCustomValidity(
              "找不到此帳戶，可能尚未註冊。",
            );
            new_password.reportValidity();
            break;
          }

          default: {
            console.error(res);
            break;
          }
        }
        submit.disabled = false;
      }
    })
    .catch((err) => {
      console.error(err);
      submit.disabled = false;
      const res = err.request.response;
      alert(res);
    });
});