export default function Home() {
  return (
    <main
      className="min-vh-100 d-flex align-items-center text-white"
      style={{
        backgroundImage: "url('https://media.licdn.com/dms/image/v2/C4D1BAQGGdNo6IlDOCQ/company-background_10000/company-background_10000/0/1583275772247?e=2147483647&v=beta&t=0yAsb6yVkN7iA8AU5_19aelUe8XoEpckJ4tdFI3m7xY')", // 🔹 เปลี่ยน path รูปตามที่มี
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container text-center py-5 rounded-4">
        <div className="p-5">
          <h1 className="mb-3 display-5 fw-bold">Welcome to TravelGo 🌍</h1>
          <div className="mb-4">
            <h5 className="fw-semibold">คุณมีแผนจะไปเที่ยวที่ไหนเร็ว ๆ นี้?</h5>
            <p className="text-light">ให้เราช่วยคุณจัดการตารางทริปให้เป็นเรื่องง่าย</p>
          </div>
          <a href="/login" className="btn btn-warning btn-lg px-4 fw-semibold shadow">
            Start Now
          </a>
        </div>
      </div>
    </main>
  );
}
