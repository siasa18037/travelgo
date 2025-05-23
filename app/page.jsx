import styles from './Home.module.css';

export default function Home() {
  return (
    <main className={`${styles.mainBackground}`}>
      <div className="container">
        <h1 className="mb-4">Welcome to TravelGo 🌍</h1>
        <p className="lead mb-4 fs-4">Your journey starts here. By Siasa group</p>
        <a className="btn btn-light btn-lg px-4 shadow-sm" href='/login'>
          Login Now
        </a>
      </div>
    </main>
  );
}
