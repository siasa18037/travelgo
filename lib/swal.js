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

export const confirmDelete = async () => {
  return await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel"
  });
};

export const confirmBox = async ({ title, text, icon, confirmButtonText, cancelButtonText ,imageUrl = '',denyButtonText='',showDenyButton=false}) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    showCancelButton: true,
    showDenyButton: showDenyButton,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    denyButtonColor:'#3085d6',
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    denyButtonText: denyButtonText,
    imageUrl: imageUrl,
  });
};

export const inputBox = async ({ title, text, icon, confirmButtonText, cancelButtonText }) => {
  return await Swal.fire({
    title: title,
    text: text,
    icon: icon,
    input: "text",
    inputAttributes: {
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  });
};