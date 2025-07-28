import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar/Navbar'
import Login from '../Components/Modal/Login'
import Sell from '../Components/Modal/Sell'
import Card from '../Components/Card/ProductCard'
import { ItemsContext } from '../Context/Item'
import { fetchFromFirestore } from '../Components/Firebase/Firebase'
import  Footer  from '../Components/Footer/Footer'


const Home = () => {
  const[openModal,setModal] = useState(false)
  const [openModalSell ,setModalSell] = useState(false)
  const [searchItem,setSearchItem] = useState("")
  const toggleModal = ()=>{setModal(!openModal)}
  const toggleModalSell = () => {setModalSell(!openModalSell)}


  const itemsCtx =ItemsContext();//refers to the context value;

  useEffect(()=>{

    const getItems = async ()=>{
      const datas = await fetchFromFirestore();
      itemsCtx ?.setItems(datas); // Fetch and set items in context
    }
    
    
    getItems();
    
  },[itemsCtx])
  
  const handleSearch = (value) => {
    console.log("Search value in Home:", value);
    setSearchItem(value);
  }

  useEffect(()=>{
    console.log('Updated Items:' ,itemsCtx.items);

  },[itemsCtx.items])


  return (
    <div>
      <Navbar toggleModal={toggleModal}   toggleModalSell={toggleModalSell} setSearchItem = {handleSearch} searchItem={searchItem}/>
      <Login  toggleModal={toggleModal}  status={openModal}/>
      <Sell setItems={(itemsCtx).setItems} toggleModalSell={toggleModalSell} status={openModalSell}  />

      <Card
        items={(itemsCtx.items || []).filter(item =>
          item.title?.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.category?.toLowerCase().includes(searchItem.toLowerCase())
        )}
      />
   
      <Footer />
    </div>
  )
}

export default Home
