import { Outlet, Link } from "react-router-dom";

function FrontendLayout() {
  return (
    <>
      <header>
        <nav className="mt-5 mb-5">
          <Link className="h4 mt-5 mx-2" to="/">
            首頁
          </Link>
          <Link className="h4 mt-5 mx-2" to="/products">
            產品頁面
          </Link>
          <Link className="h4 mt-5 mx-2" to="/cart">
            購物車頁面
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-5 text-center">
        <p>© 2025 我的網站</p>
      </footer>
    </>
  );
}

export default FrontendLayout;
