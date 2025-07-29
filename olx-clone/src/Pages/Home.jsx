import React, { useEffect, useState } from 'react'
import Login from '../Components/Modal/Login'
import Sell from '../Components/Modal/Sell'
import Card from '../Components/Card/ProductCard'
import { ItemsContext } from '../Context/Item'
import { fetchFromFirestore } from '../Components/Firebase/Firebase'
import Footer from '../Components/Footer/Footer'

const Home = () => {
  const [openModal, setModal] = useState(false)
  const [openModalSell, setModalSell] = useState(false)

  const toggleModal = () => setModal(!openModal)
  const toggleModalSell = () => setModalSell(!openModalSell)

  const itemsCtx = ItemsContext()

  useEffect(() => {
    const getItems = async () => {
      const datas = await fetchFromFirestore()
      itemsCtx?.setItems(datas)
    }
    getItems()
  }, [itemsCtx])

  return (
    <div>
      <Login toggleModal={toggleModal} status={openModal} />
      <Sell setItems={itemsCtx.setItems} toggleModalSell={toggleModalSell} status={openModalSell} />

      <Card items={itemsCtx.items || []} />
      <Footer />
    </div>
  )
}

export default Home
