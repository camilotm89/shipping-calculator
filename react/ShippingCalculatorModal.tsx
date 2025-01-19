import React, { useState } from 'react'
import { Modal, Button } from 'vtex.styleguide'
import './ShippingCalculatorModal.css'

const ShippingCalculatorModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [postalCode, setPostalCode] = useState('')
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen)
    setPostalCode('')
    setShippingOptions([])
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
              id: 1, 
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
        const options = data.logisticsInfo[1].slas.map((sla: any) => ({
          name: sla.name,
          price: sla.price / 100,
          deliveryTime: sla.shippingEstimate,
        }))
        setShippingOptions(options)
      } else {
        setShippingOptions([])
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
          <div style={{ marginTop: '20px' }}>
            {shippingOptions.length > 0 ? (
              <ul>
                {shippingOptions.map((option, index) => (
                  <li key={index}>
                    {option.name} - ${option.price.toFixed(2)} - {option.deliveryTime}
                  </li>
                ))}
              </ul>
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
