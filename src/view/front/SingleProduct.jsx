import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function SingleProduct() {
  //   const location = useLocation();
  //   const product = location.state?.productData;

  const { id } = useParams();
  const [product, setProduct] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleView = async (id) => {
      try {
        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/product/${id}`,
        );
        setProduct(response.data.product);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // 成功或失敗都要關閉 loading
      }
    };
    handleView(id);
  }, [id]);

  const addCart = async (id, qty = 1) => {
    try {
      const data = {
        product_id: id,
        qty,
      };
      const response = await axios.post(`${API_BASE}/api/${API_PATH}/cart`, {
        data,
      });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  if (loading) return <h2>載入中...</h2>;
  if (!product) return <h2>查無產品</h2>;

  return (
    <div className="container mt-3">
      <div className="card" style={{ width: "18rem" }}>
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            className="card-img-top"
            alt={product.title}
          />
        )}
        <div className="card-body">
          <h5 className="card-title">{product.title}</h5>
          <p className="card-text">{product.description}</p>
          <p className="card-text">價格：{product.price}</p>
          <p className="card-text">
            <small className="text-body-secondary">{product.unit}</small>
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => addCart(product.id)}
          >
            加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}

export default SingleProduct;
