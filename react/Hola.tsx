import React from 'react'

type Props = {
  name: string
}

function Hola({ name }: Props) {
  return <div>Hey, {name}</div>
}

export default Hola
