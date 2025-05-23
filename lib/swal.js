// lib/swal.js
import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const showSuccessToast = (title = "สำเร็จ!") => {
  Toast.fire({
    icon: "success",
    title,
  });
};

export const showErrorToast = (title = "เกิดข้อผิดพลาด") => {
  Toast.fire({
    icon: "error",
    title,
  });
};

export const showWarningToast = (title = "คำเตือน") => {
  Toast.fire({
    icon: "warning",
    title,
  });
};
