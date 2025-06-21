export default function Home() {
  return (
    <main className="min-vh-100 d-flex align-items-center">
      <div className="container text-center py-5">
        <div className="p-5 ">
          <h1 className="mb-3 display-5 fw-bold ">Welcome to TravelGo 🌍</h1>
          <div className="mb-4">
            <h5 className="fw-semibold">คุณมีแผนจะไปเที่ยวที่ไหนเร็ว ๆ นี้?</h5>
            <p className="text-muted">ให้เราช่วยคุณจัดการตารางทริปให้เป็นเรื่องง่าย</p>
          </div>
          <a
            href="/login"
            className="btn btn-outline-warning btn-lg px-4 ">
            Start Now
          </a>
        </div>
      </div>
    </main>
  );
}
