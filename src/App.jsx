import { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as bootstrap from "bootstrap";

import "./assets/style.css";
import "./App.css";
import ProductModal from "./components/ProductModal";
import Pagination from "./components/pagination";

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
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

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

  const updateProduct = async (id) => {
    let apiUrl = `${url}/api/${apiPATH}/admin/product`;
    let method = "post";

    if (modalType === "edit") {
      apiUrl = `${url}/api/${apiPATH}/admin/product/${id}`;
      method = "put";
    }

    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        imagesUrl: [...templateProduct.imagesUrl.filter((url) => url !== "")],
      },
    };

    try {
      const res = await axios[method](apiUrl, productData);
      console.log(res.data);
      getData();
      closeModal();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  const deleteProduct = async (id) => {
    console.log("delete id:", id);
    console.log("delete url:", `${url}/api/${apiPATH}/admin/product/${id}`);
    try {
      const res = await axios.delete(
        `${url}/api/${apiPATH}/admin/product/${id}`,
      );
      console.log(res.data);
      getData();
      closeModal();
    } catch (error) {
      alert(error.response.data.message);
    }
  };

  // const handleModalImageChange = (index, value) => {
  //   setTemplateProduct((pre) => {
  //     const newImages = [...pre.imagesUrl];
  //     newImages[index] = value;

  const handleModalChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages[index] = value;

      if (
        value !== "" &&
        index === newImages.length - 1 &&
        newImages.length < 5
      ) {
        newImages.push("");
      }

      if (
        newImages.length > 1 &&
        newImages[newImages.length - 1] === "" &&
        newImages[newImages.length - 2] === ""
      ) {
        newImages.pop();
      }

      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file-to-upload", file);
      const res = await axios.post(
        `${url}/api/${apiPATH}/admin/upload`,
        formData,
      );
      setTemplateProduct((pre) => ({
        ...pre,
        imageUrl: res.data.imageUrl,
      }));
    } catch (err) {
      console.log(err.response);
    }
  };

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.push("");
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImages = [...pre.imagesUrl];
      newImages.pop("");
      return {
        ...pre,
        imagesUrl: newImages,
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((pre) => ({ ...pre, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${url}/admin/signin`, formData);
      const { token, expired } = res.data;

      document.cookie = `hexToken=${token}; expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;

      getData();
      setIsAuth(true);
    } catch (err) {
      console.log("完整錯誤:", err.response);
      alert("登入失敗: " + (err.response?.data?.message || "請檢查帳號密碼"));
      setIsAuth(false);
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
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-12">
              <form
                id="form"
                className="form-signin"
                onSubmit={(e) => handleSubmit(e)}
              >
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    name="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={(e) => handleInputChange(e)}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        handleModalChange={handleModalChange}
        handleModalImageChange={handleModalImageChange}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
        closeModal={closeModal}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
        uploadImage={uploadImage}
      />
    </>
  );
}

export default App;
