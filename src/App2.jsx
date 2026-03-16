import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

import "./assets/style.css";
import "./App.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/pagination";
import Login from "./view/login";

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [""],
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState("");
  const [pagination, setPagination] = useState({});

  const productModalRef = useRef(null);

  const url = "https://ec-course-api.hexschool.io/v2";
  const apiPATH = "yuchen";

  const checkLogin = async () => {
    try {
      const res = await axios.post(`${url}/api/user/check`);
      console.log(res.data);
      setIsAuth(true);
      getData();
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common.Authorization = token;
    }

    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false,
    });

    checkLogin();
  }, []);

  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct((pre) => ({
      ...pre,
      ...product,
    }));
    setTimeout(() => productModalRef.current.show(), 0);
  };

  const closeModal = (type, product) => {
    productModalRef.current.hide();
  };

  const getData = async (page = 1) => {
    try {
      const res = await axios.get(
        `${url}/api/${apiPATH}/admin/products?page=${page}`,
      );
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  return (
    <>
      {isAuth ? (
        <div className="container">
          <div className="row mt-5">
            <h2>產品列表</h2>
            <div className="text-end mt-4 mb-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openModal("create", INITIAL_TEMPLATE_DATA)}
              >
                建立新的產品
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>分類</th>
                  <th>產品名稱</th>
                  <th>原價</th>
                  <th>售價</th>
                  <th>是否啟用</th>
                  <th>編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.title}</td>
                      <td>{item.origin_price}</td>
                      <td>{item.price}</td>
                      <td className={`${item.is_enabled && "text-success"}`}>
                        {item.is_enabled ? "啟用" : "未啟用"}
                      </td>
                      <td>
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Basic example"
                        >
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => openModal("edit", item)}
                          >
                            編輯
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => openModal("delete", item)}
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination pagination={pagination} onChangepage={getData} />
          </div>
        </div>
      ) : (
        <Login getData={getData} setIsAuth={setIsAuth} />
      )}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        getData={getData}
        closeModal={closeModal}
      />
    </>
  );
}

export default App;
