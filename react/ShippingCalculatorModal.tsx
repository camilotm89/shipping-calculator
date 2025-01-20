import React, { useState } from 'react'
import { Modal, Button } from 'vtex.styleguide'
import './ShippingCalculatorModal.css'
import {useProduct} from 'vtex.product-context'

const ShippingCalculatorModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  const [deliveryShippingOptions, setDeliveryShippingOptions] = useState<any[]>([])
  const [deliveryPickupOptions, setDeliveryPickupOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const productContext = useProduct() // Obtén el contexto del producto
  const skuId = productContext?.selectedItem?.itemId // 

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
    setPostalCode('')
    setDeliveryShippingOptions([])
    setDeliveryPickupOptions([])
    
  }

  const fetchShippingOptions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/checkout/pub/orderForms/simulation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [
            {
              id: skuId, 
              quantity: 1,
              seller: '1',
            },
          ],
          postalCode,
          country: 'ARG',
        }),
      })

      const data = await response.json()
      if (data?.logisticsInfo?.length) {
        
        const deliverys = data.logisticsInfo[1].slas.filter((sla: any) => sla.deliveryChannel =="delivery")
        const pickUpPoints = data.logisticsInfo[1].slas.filter((sla: any) => sla.deliveryChannel =="pickup-in-point")
        
        
        
        setDeliveryShippingOptions(deliverys.map((sla: any) => ({
            name: sla.name,
            price: sla.price / 100,
            deliveryTime: sla.shippingEstimate,
          })))
        setDeliveryPickupOptions(pickUpPoints.map((sla: any) => ({
            name: sla.name,
            price: sla.price / 100,
            deliveryTime: sla.shippingEstimate,
          })))
      } else {
        setDeliveryShippingOptions([])
        setDeliveryPickupOptions([])
      }
    } catch (error) {
      console.error('Error fetching shipping options:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <span 
        style={{ cursor: 'pointer', color: '#0B74E5' }} 
        onClick={toggleModal}
      >
        Calcular costo de envío
      </span>

      <Modal
        isOpen={isModalOpen}
        onClose={toggleModal}
        title="Calcular costo de envío"
        
      >
        <div>
            <div className='postal-code-input'>
          <input
            type="text"
            value={postalCode}
            placeholder="Ingresa tu código postal"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
          />
          <Button
            onClick={fetchShippingOptions}
            isLoading={loading}
            disabled={!postalCode}
            style={{ marginTop: '10px' }}
            variation="tertiary"
            
          >
            Calcular Envío
          </Button>
          </div>
            <div style={{ marginTop: '20px' }} className="shipping-table">
                {deliveryShippingOptions.length > 0 || deliveryPickupOptions.length>0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Tipo de envío</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Tiempo estimado</th>
                    <th style={{ textAlign: 'left', padding: '8px' }}>Costo</th>
                    </tr>
                    <tr>
                        <td style={{color:"green", fontWeight:"bolder", textAlign: 'left', padding: '8px',}}>Envío a domicilio</td>
                        <td></td>
                        <td> <img src={require('./assets/delivery.png')} style={{height:'30px', padding:"8px"}} ></img> </td>
                    </tr>
                </thead>
                <tbody>
                    {deliveryShippingOptions.map((option, index) => (
                    <tr key={index}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{option.name}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}> Hasta {option.deliveryTime.replace("bd", "")} días hábiles</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>${option.price.toFixed(2)}</td>
                    </tr>
                    
                    ))}
                    <tr>
                        <td style={{color:"green", fontWeight:"bolder", textAlign: 'left', padding: '8px',}}>Punto de retiro</td>
                        <td></td>
                        <td><img src={require('./assets/pickup.png')} style={{height:'30px', padding:"8px"}} ></img></td>
                    </tr>
                    {deliveryPickupOptions.map((option, index) => (
                    <tr key={index}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{option.name}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}> Hasta {option.deliveryTime.replace("bd", "")} días hábiles</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>${option.price.toFixed(2)}</td>
                    </tr>
                    
                    ))}
                </tbody>
                </table>
            ) : (
                !loading && <p>No hay opciones de envío disponibles.</p>
            )}
            </div>

        </div>
      </Modal>
    </div>
  )
}

export default ShippingCalculatorModal
