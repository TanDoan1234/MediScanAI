// API configuration
const getApiUrl = () => {
  // In production (Vercel), use relative path
  if (import.meta.env.PROD) {
    return "/api";
  }

  // In development
  // Nếu có VITE_API_URL trong .env, sử dụng nó (ưu tiên cao nhất)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;

  // Detect port forwarding của IDE (Cursor/VS Code)
  // URL thường có dạng: xxx.cursor.sh, xxx.vscode.dev, hoặc có port forwarding
  if (
    hostname.includes("cursor.sh") ||
    hostname.includes("vscode.dev") ||
    hostname.includes("github.dev")
  ) {
    // Đang dùng port forwarding của IDE
    // Cần forward cả port 5000 trong IDE và dùng cùng domain
    // Hoặc dùng IP local thay vì port forwarding
    console.warn(
      "⚠️ Đang dùng port forwarding của IDE. Đảm bảo đã forward cả port 5000!"
    );
    // Thử dùng cùng domain với port 5000 (nếu đã forward)
    return `https://${hostname.replace(/:\d+$/, "")}:5000/api`;
  }

  // Tự động detect: nếu đang truy cập từ IP khác localhost, dùng IP đó cho backend
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    // Đang truy cập từ mobile/network, dùng cùng IP cho backend
    return `http://${hostname}:5000/api`;
  }

  // Mặc định: localhost
  return "http://localhost:5000/api";
};

export const API_URL = getApiUrl();
