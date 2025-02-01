import { useEffect, useState, useRef } from "react";
import { Modal } from 'bootstrap'
import axios from "axios";


const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

// modal預設資料
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""]
};

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);

  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });

  const handleInputChange = (e) => {
    const { value, name } = e.target;

    setAccount({
      ...account,
      [name]: value,
    });
  };

  const getProducts = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/v2/api/${API_PATH}/admin/products`
      );
      setProducts(res.data.products);
    } catch (error) {
      alert("取得產品失敗");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/v2/admin/signin`, account);

      const { token, expired } = res.data;
      document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;

      axios.defaults.headers.common["Authorization"] = token;

      getProducts();

      setIsAuth(true);
    } catch (error) {
      alert("登入失敗");
    }
  };

  const checkUserLogin = async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      console.log("使用者已登入");
      // 取得產品資料
      getProducts();
      // 設定登入狀態
      setIsAuth(true);
      } catch (error) {
      console.error(error);
    }
  };

  // 自動檢查登入狀態
  useEffect(()=>{
    // 取得token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1",
    );
    // 將token放入headers中
    axios.defaults.headers.common['Authorization'] = token;
    // 執行檢查函式（設定登入狀態）
    checkUserLogin();
  },[])

  // 透過useRef取得DOM
  const productModalRef = useRef(null);
  const delProductModalRef = useRef(null);
    // 畫面渲染後取得DOM
    useEffect(()=>{
    // 建立Modal實例（才能控制Modal行為）+綁定DOM(productModalRef.current)+關閉預設點擊背景關閉modal
    new Modal(productModalRef.current,{
      backdrop: false
    });
    new Modal(delProductModalRef.current,{
      backdrop: false
    });
    // 檢查Modal是否有實例
    // console.log(Modal.getInstance(productModalRef.current));
    // console.log(Modal.getInstance(delProductModalRef.current));
    },[])

    // 設定開啟Modal
    const openModal = (mode, product) => {
        // 判斷編輯或新增的Modal狀態（第2步驟）
        setModalMode(mode);
        // 判斷編輯或新增
        if(mode === "edit"){
          // 帶入產品資料（帶入product參數，因為return的表單是以product引入資料）
          setTempProduct(product);
        }else if(mode === 'create'){
          setTempProduct(defaultModalState);
        }

      // 取得前面建立好的Modal實例
      const modalInstance = Modal.getInstance(productModalRef.current);
      // 顯示Modal
      modalInstance.show();
    }

    // 設定關閉Modal
    const closeModal = () => {
      // 取得前面建立好的Modal實例
      const modalInstance = Modal.getInstance(productModalRef.current);
      // 關閉Modal
      modalInstance.hide();
    }

    // 設定開啟DeleteModal
    const openDelProductModal = (product) => {
      // 取得前面建立好的Modal實例
      const modalInstance = Modal.getInstance(delProductModalRef.current);
      // 關閉Modal
      modalInstance.show();

      // 取得產品title
      setTempProduct(product);
    }

    // 設定關閉DeleteModal
    const closeDelProductModal = () => {
      // 取得前面建立好的Modal實例
      const modalInstance = Modal.getInstance(delProductModalRef.current);
      // 關閉Modal
      modalInstance.hide();
    }
    
    // 編輯產品資料
      // 綁定Modal狀態
      // useState建立狀態,tempProduct目前產品資料狀態（初始值為defaultModalState）,setTempProduct更新狀態的方法
      const [tempProduct, setTempProduct] = useState(defaultModalState);

      // 處理表單輸入的資料
      const handleModalInputChange = (e) => {
        // 從事件中取得value與name（這邊的e.target是觸發的input表單欄位）,name對應defaultModalState的name屬性, value對應欄位輸入的值
        const { value, name, checked, type }=e.target;
        // 更新狀態
        setTempProduct({
          // 保留原始屬性
          ...tempProduct,
          // 動態更新屬性(先檢查type是不是checkbox，如果是checkbox就更新checked值，如果不是就更新value值)
          [name]:type === 'checkbox' ? checked : value
        });
        // console.log(tempProduct);可以看到is_enabled的值已經更新成true/false
      }

      // 判斷當前動作是新增產品還是編輯產品：
        // 1.新增一個狀態來判斷：
          // 點擊按鈕時將null改成其他字串，例如按新增時改為'create'，按編輯時改為'edit'
          const [modalMode, setModalMode] = useState(null);

        // 2.在點擊新增或編輯產品按鈕時改變它的值：
          // 將setModalMode設定在openModal函式中
          // 在return裡面加上onClick={() => openModal('create')}及onClick={() => openModal('edit')}
          
        // 3.調整產品Modal的標題、傳入的值：
          // 在return的modal頁面標題加上{modalMode === 'create' ? '新增產品' : '編輯產品'}

      // 編輯產品時將產品資料傳到modal頁面：
        // 1.在openModal函式中將setTempProduct傳入(以product作為參數)
        // 2.在return編輯按鈕button時加上onClick={() => openModal('edit', product)}

      // 綁定產品副圖input狀態
        // 監聽input的onChange事件（只處理input變化）
        // 1.在return modal頁面的副圖input欄位加上value={image} onChange={handleImageChange}
        const handleImageChange = (e, index) => {
          // 取得input輸入的值
          // 因為有多個欄位，所以要判斷是陣列的第幾筆資料，所以參數要加上index
          const { value } = e.target;
          // 建立新陣列
          const newImages = [...tempProduct.imagesUrl];
          // 更新新陣列的值
          newImages[index] = value;
          // 更新狀態
          setTempProduct({
            ...tempProduct,
            imagesUrl: newImages
          })
        }

      // 點擊新增副圖增加一個空資料""
      const handleAddImage = ()=>{
        const newImages=[...tempProduct.imagesUrl,""];
        setTempProduct({
          ...tempProduct,
          imagesUrl: newImages
        })
      }

      // 點擊取消副圖時刪除最後一筆資料
      const handleRemoveImage = ()=>{
        const newImages=[...tempProduct.imagesUrl];
        // .pop()移除陣列最後一個值
        newImages.pop();
        setTempProduct({
          ...tempProduct,
          imagesUrl: newImages
        })
      };

      // 新增產品
      const createProduct = async () => {
        try{
          await axios.post(`${BASE_URL}/v2/api/${API_PATH}/admin/product`,{
            data:{
              ...tempProduct,
              // 因為API資料規定型別，所以要轉型
              origin_price: Number(tempProduct.origin_price),
              price: Number(tempProduct.price),
              is_enabled: tempProduct.is_enabled ? 1 : 0
            }
          })
        }
        catch(error){
          alert("新增產品失敗");
        }
      }

       // 編輯產品資料
      const updateProduct = async () => {
        try{
          await axios.put(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`,{
            data:{
              ...tempProduct,
              // 因為API資料規定型別，所以要轉型
              origin_price: Number(tempProduct.origin_price),
              price: Number(tempProduct.price),
              is_enabled: tempProduct.is_enabled ? 1 : 0
            }
          })
        }
        catch(error){
          alert("新增產品失敗");
        }
      }

      // 點擊確認時呼叫createProduct函式
      const handleUpdateProduct = async () => {
        // 判斷編輯或新增的Modal狀態
        const callApi = modalMode === 'edit' ? updateProduct : createProduct;

        try{
        // post新產品資料
        await callApi();
        // 刷新產品列表(已經等新產品資料post才get，所以不用await)
        getProducts();
        // 關閉modal(不用等待取得資料才執行，所以不用await)
        closeModal();
        }
        catch(error){
          alert("新增產品失敗");
        }
      }

      // 刪除產品
      const deleteProduct = async () => {
        try{
          await axios.delete(`${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`)
        }
        catch(error){
          alert("新增產品失敗");
        }
      }

      // 點擊刪除時呼叫deleteProduct函式
      const handleDeleteProduct = async () => { 
        try{
          await deleteProduct();
          getProducts();
          closeDelProductModal();
        }
        catch(error){
          alert("刪除產品失敗");
        }
      }


  return (
    <>
      {isAuth ? (
        <div className="container py-5">
          <div className="row">
            <div className="col">
              <div className="d-flex justify-content-between">
              <h2>產品列表</h2>
              {/*要以箭頭函式寫入，如果寫openModal會在畫面渲染到button時就執行函式，用箭頭函式才會在點擊時執行*/}
              <button onClick={()=>openModal('create')} type="button" className="btn btn-primary">建立新的產品</button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      {/* 判斷是否啟用 */}
                      <td>{product.is_enabled?
                        <span className="text-success">啟用</span>:<span>未啟用</span>}</td>
                      <td>
                      <div className="btn-group">
                {/*此處帶入的product是外層map的product */}
                <button onClick={()=>openModal('edit', product)} type="button" className="btn btn-outline-primary btn-sm">編輯</button>
                <button onClick={()=>openDelProductModal(product)} type="button" className="btn btn-outline-danger btn-sm">刪除</button>
              </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
            <div className="form-floating mb-3">
              <input
                name="username"
                value={account.username}
                onChange={handleInputChange}
                type="email"
                className="form-control"
                id="username"
                placeholder="name@example.com"
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                name="password"
                value={account.password}
                onChange={handleInputChange}
                type="password"
                className="form-control"
                id="password"
                placeholder="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}

{/*  Modal */}
<div ref={productModalRef} id="productModal" className="modal" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
  <div className="modal-dialog modal-dialog-centered modal-xl">
    <div className="modal-content border-0 shadow">
      <div className="modal-header border-bottom">
        <h5 className="modal-title fs-4">{modalMode === 'create' ? '新增產品' : '編輯產品'}</h5>
        <button onClick={closeModal} type="button" className="btn-close" aria-label="Close"></button>
      </div>

      <div className="modal-body p-4">
        <div className="row g-4">
          <div className="col-md-4">
            <div className="mb-4">
              <label htmlFor="primary-image" className="form-label">
                主圖
              </label>
              <div className="input-group">
                <input
                  value ={tempProduct.imageUrl}
                  onChange = {handleModalInputChange}
                  name="imageUrl"
                  type="text"
                  id="primary-image"
                  className="form-control"
                  placeholder="請輸入圖片連結"
                />
              </div>
              <img
                src={tempProduct.imageUrl}
                alt={tempProduct.title}
                className="img-fluid"
              />
            </div>

            {/* 副圖 */}
            <div className="border border-2 border-dashed rounded-3 p-3">
              {tempProduct.imagesUrl?.map((image, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor={`imagesUrl-${index + 1}`}
                    className="form-label"
                  >
                    副圖 {index + 1}
                  </label>
                  <input
                    value={image}
                    onChange={(e)=>handleImageChange(e, index)}
                    type="text"
                    placeholder={`圖片網址 ${index + 1}`}
                    className="form-control mb-2"
                  />
                  {image && (
                    <img
                      src={image}
                      alt={`副圖 ${index + 1}`}
                      className="img-fluid mb-2"
                    />
                  )}
                </div>
              ))}
              
              <div className="btn-group w-100">
                {/* 顯示條件：圖片數量未達5張時->圖片有值時 */}
                {/* 這段是短路運算，當左邊條件為true就繼續執行右邊條件 */}
                {tempProduct.imagesUrl.length < 5 && 
                tempProduct.imagesUrl[tempProduct.imagesUrl.length -1] !== '' && (
                <button onClick={handleAddImage} className="btn btn-outline-primary btn-sm w-100">新增圖片</button>
                )}
                
                {/* 顯示條件： 非唯一欄位（至少要有一筆/}
                {/* 點擊時移除陣列最後一筆 */}
                {tempProduct.imagesUrl.length >1 &&(
                  <button onClick={handleRemoveImage} className="btn btn-outline-danger btn-sm w-100">取消圖片</button>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                標題
              </label>
              <input
                value={tempProduct.title}
                onChange={handleModalInputChange}
                name="title"
                id="title"
                type="text"
                className="form-control"
                placeholder="請輸入標題"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                分類
              </label>
              <input
                value={tempProduct.category}
                onChange={handleModalInputChange}
                name="category"
                id="category"
                type="text"
                className="form-control"
                placeholder="請輸入分類"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="unit" className="form-label">
                單位
              </label>
              <input
                value={tempProduct.unit}
                onChange={handleModalInputChange}
                name="unit"
                id="unit"
                type="text"
                className="form-control"
                placeholder="請輸入單位"
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-6">
                <label htmlFor="origin_price" className="form-label">
                  原價
                </label>
                <input
                  value={tempProduct.origin_price}
                  onChange={handleModalInputChange}
                  name="origin_price"
                  id="origin_price"
                  type="number"
                  className="form-control"
                  placeholder="請輸入原價"
                />
              </div>
              <div className="col-6">
                <label htmlFor="price" className="form-label">
                  售價
                </label>
                <input
                  value={tempProduct.price}
                  onChange={handleModalInputChange}
                  name="price"
                  id="price"
                  type="number"
                  className="form-control"
                  placeholder="請輸入售價"
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                產品描述
              </label>
              <textarea
                value={tempProduct.description}
                onChange={handleModalInputChange}
                name="description"
                id="description"
                className="form-control"
                rows={4}
                placeholder="請輸入產品描述"
              ></textarea>
            </div>

            <div className="mb-3">
              <label htmlFor="content" className="form-label">
                說明內容
              </label>
              <textarea
                value={tempProduct.content}
                onChange={handleModalInputChange}
                name="content"
                id="content"
                className="form-control"
                rows={4}
                placeholder="請輸入說明內容"
              ></textarea>
            </div>

            <div className="form-check">
              <input
              /*checkbox要用checked取得boolean狀態*/
                checked={tempProduct.is_enabled}
                onChange={handleModalInputChange}
                name="is_enabled"
                type="checkbox"
                className="form-check-input"
                id="isEnabled"
              />
              <label className="form-check-label" htmlFor="isEnabled">
                是否啟用
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-footer border-top bg-light">
        <button onClick={closeModal} type="button" className="btn btn-secondary">
          取消
        </button>
        <button onClick={handleUpdateProduct} type="button" className="btn btn-primary">
          確認
        </button>
      </div>
    </div>
  </div>
</div>
<div ref={delProductModalRef}
  className="modal fade"
  id="delProductModal"
  tabIndex="-1"
  style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
>
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <h1 className="modal-title fs-5">刪除產品</h1>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        你是否要刪除 
        <span className="text-danger fw-bold">{tempProduct.title}</span>
      </div>
      <div className="modal-footer">
        <button
          onClick={closeDelProductModal}
          type="button"
          className="btn btn-secondary"
        >
          取消
        </button>
        <button
        onClick={handleDeleteProduct}
        type="button" className="btn btn-danger">
          刪除
        </button>
      </div>
    </div>
  </div>
</div>
    </>    
  );
}

export default App;