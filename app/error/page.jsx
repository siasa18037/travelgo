'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Error() {
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="d-flex align-items-center min-vh-100 bg-light">
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-md-6 order-md-2 text-center">
            <div>
              <lottie-player
                src="https://assets9.lottiefiles.com/packages/lf20_kcsr6fcp.json"
                background="transparent"
                speed="1"
                loop
                autoplay
                style={{ width: '100%', maxWidth: '400px', margin: 'auto' }}
              ></lottie-player>
            </div>
          </div>
          <div className="col-md-6 text-center text-md-start">
            <h1 className="display-1 fw-bold text-muted">Error 404</h1>
            <p className="fs-5 fw-light mb-4">
              The page you are looking for was moved, removed, or might never have existed.
            </p>
            <button
              className="btn btn-lg btn-secondary"
              onClick={() => router.push('/')}
            >
              Back to homepage
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
