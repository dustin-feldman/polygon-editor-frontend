// src/utils/toast.js
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const showSuccess = (msg) => Toast.fire({ icon: "success", title: msg });
const showError = (msg) => Toast.fire({ icon: "error", title: msg });

export { showSuccess, showError, Toast };
